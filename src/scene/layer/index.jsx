/* Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import esriLoader from 'esri-loader';

import { loadLayer } from './load';

import Graphic from './graphic';

const ChildComponents = [Graphic];

const layerSettingsProps = {
  id: PropTypes.string.isRequired,
  url: PropTypes.string,
  portalItem: PropTypes.object,
  layerType: PropTypes.oneOf([
    'feature',
    'scene',
    'tile',
    'vector-tile',
    'integrated-mesh',
    'point-cloud',
    'building-scene',
  ]).isRequired,
  visible: PropTypes.bool,
  definitionExpression: PropTypes.string,
  renderer: PropTypes.object,
  rendererJson: PropTypes.object,
  labelingInfo: PropTypes.object,
  labelsVisible: PropTypes.bool,
  outFields: PropTypes.arrayOf(PropTypes.string),
  elevationInfo: PropTypes.object,
  geometryType: PropTypes.string,
  hasZ: PropTypes.bool,
  fields: PropTypes.array,
  objectIdField: PropTypes.string,
  objectIdFilter: PropTypes.object,
  selectable: PropTypes.bool,
  relatedLayer: PropTypes.string,
  spatialReference: PropTypes.object,
  opacity: PropTypes.number,
  minScale: PropTypes.number,
  maxScale: PropTypes.number,
  featureReduction: PropTypes.object,
  source: PropTypes.array,
  legendEnabled: PropTypes.bool,
  title: PropTypes.string,
  maskingGeometry: PropTypes.object,
  onLoad: PropTypes.func,
};


const getLayerSettings = (props) => {
  const settings = {};

  Object.keys(layerSettingsProps)
    .filter(key => props[key] !== null && props[key] !== undefined)
    .forEach(key => settings[key] = props[key]);

  return settings;
};


const getLayerUpdates = (props, nextProps) => {
  const changes = Object.keys(layerSettingsProps)
    .filter(key => props[key] !== nextProps[key]);

  if (changes.length === 0) return null;

  const updates = {};
  changes.forEach(key => updates[key] = nextProps[key]);

  return updates;
};


const getOIDfromGlobalId = (layerView, GlobalID) => {
  const graphic = layerView.controller.graphics.find(e => e.attributes.GlobalID === GlobalID);

  if (!graphic) return null;
  return graphic.attributes[layerView.layer.objectIdField];
};


const getHighlightOIDs = (layerView, mysteryIds) => mysteryIds.map(mysteryId => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mysteryId) ?
    getOIDfromGlobalId(layerView, mysteryId) : mysteryId
));


class Layer extends Component {
  static getDerivedStateFromProps(props, state) {
    const newState = {
      highlights: props.highlight && props.highlight.length &&
        state.layerView && state.layerView.highlight &&
        state.layerView.highlight(getHighlightOIDs(state.layerView, props.highlight)),
    };

    if (state.highlights) state.highlights.remove();

    return newState;
  }

  constructor(props) {
    super(props);
    this.state = {
      layer: null,
      layerView: null,
      highlights: null,
    };
  }

  componentDidMount() {
    this.componentIsMounted = true;
    const layerSettings = getLayerSettings(this.props);
    this.load(this.props.view, layerSettings);
  }

  async componentDidUpdate(prevProps) {
    if (!this.state.layer) return;

    // refresh layer
    if (this.props.refresh !== prevProps.refresh) {
      const layerView = this.state.layerView;
      layerView.refresh();
    }

    const updatesDiff = getLayerUpdates(prevProps, this.props);
    if (!updatesDiff) return;

    // update layer settings
    const { rendererJson, source, maskingGeometry, ...updates } = updatesDiff;

    Object.keys(updates).forEach(key => this.state.layer[key] = updates[key]);

    if (rendererJson && rendererJson !== prevProps.rendererJson) {
      const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);

      // After every await, need to check if component is still mounted
      if (!this.componentIsMounted) return;

      this.state.layer.renderer = rendererJsonUtils.fromJSON(rendererJson);
    }

    // update source graphics
    if (this.props.source !== prevProps.source) {
      const newFeatures = this.props.source
        .filter(feature => !prevProps.source.includes(feature));

      const oldFeatures = prevProps.source
        .filter(feature => !this.props.source.includes(feature));

      if (!newFeatures.length && !oldFeatures.length) return;

      this.state.layer.applyEdits({
        addFeatures: newFeatures,
        deleteFeatures: oldFeatures,
      });
    }

    // update zoomTo
    if (this.props.zoomTo && !prevProps.zoomTo) {
      this.state.layer.when(() => this.props.view.goTo(this.state.layer.fullExtent));
    }

    // fix refresh bug
    if (this.props.visible && this.props.visible !== prevProps.visible) {
      const layerView = this.state.layerView;
      if (layerView && layerView.refresh) layerView.refresh();
    }

    if (this.props.maskingGeometry !== prevProps.maskinggeometry) {
      const layerView = this.state.layerView;
      if (!layerView) return;

      const [FeatureFilter, Polygon] = await esriLoader.loadModules([
        'esri/views/layers/support/FeatureFilter',
        'esri/geometry/Polygon',
      ]);

      layerView.filter = this.props.maskingGeometry ? new FeatureFilter({
        geometry: new Polygon(this.props.maskingGeometry),
        spatialRelationship: 'disjoint',
      }) : null;
    }
  }

  componentWillUnmount() {
    this.componentIsMounted = false;
    if (!this.state.layer) return;

    // TODO: this prob. needs to be changed
    if (this.state.layer.source && this.state.layer.source.removeAll) {
      this.state.layer.source.removeAll();
    }

    this.props.view.map.layers.remove(this.state.layer);
  }


  async load(view, layerSettings) {
    if (!view) return;

    // Check if already exists (e.g., after hot reload)
    const existingLayer = view.map.layers.items.find(l => l.id === layerSettings.id);
    const layer = existingLayer || await loadLayer(layerSettings);

    // After every await, need to check if component is still mounted
    if (!this.componentIsMounted || !layer) return;

    this.setState({
      layer,
    });

    // Add layer to map
    view.map.add(layer);
    const layerView = await view.whenLayerView(layer);
    this.props.onLoad({ id: layerSettings.id });

    // After every await, need to check if component is still mounted
    if (!this.componentIsMounted) {
      view.map.remove(layer);
      return;
    }

    this.setState({
      layerView,
    });

    // Apply layer updates if needed
    const {
      rendererJson,
      labelingInfoJson,
      source,
      ...updates
    } = layerSettings;

    Object.keys(updates).forEach(key => this.state.layer[key] = updates[key]);

    if (rendererJson) {
      const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);

      // After every await, need to check if component is still mounted
      if (!this.componentIsMounted) return;

      this.state.layer.renderer = rendererJsonUtils.fromJSON(rendererJson);
    }

    if (this.props.selection && this.props.selection.length) {
      this.setState({ highlights: this.state.layerView.highlight(this.props.selection) });
    }

    if (this.props.zoomTo) {
      // TODO: check this syntax
      this.state.layer.when(() => this.props.view.goTo(this.state.layer.fullExtent));
    }
  }

  render() {
    return this.state.layer && (
      <div>
        {React.Children.map(this.props.children, child =>
          child && React.cloneElement(child, { layer: this.state.layer }))}
      </div>
    );
  }
}


Layer.propTypes = {
  children: (props, propName, componentName) => {
    const prop = props[propName];

    let error = null;
    React.Children.forEach(prop, (child) => {
      if (child && !ChildComponents.includes(child.type)) {
        error = new Error(`'${componentName}' has invalid children component(s).`);
      }
    });
    return error;
  },
  ...layerSettingsProps,
  refresh: PropTypes.number,
  highlight: PropTypes.array,
  zoomTo: PropTypes.bool,
  view: PropTypes.object.isRequired,
};


Layer.defaultProps = {
  children: [],
  url: null,
  portalItem: null,
  visible: true,
  selectable: false,
  relatedLayer: null,
  definitionExpression: null,
  renderer: null,
  rendererJson: null,
  labelingInfo: null,
  labelsVisible: false,
  outFields: ['*'],
  elevationInfo: null,
  geometryType: null,
  hasZ: false,
  fields: null,
  objectIdField: null,
  objectIdFilter: null,
  spatialReference: null,
  refresh: null,
  highlight: [],
  zoomTo: false,
  opacity: null,
  minScale: null,
  maxScale: null,
  featureReduction: null,
  source: null,
  legendEnabled: true,
  title: null,
  maskingGeometry: null,
  onLoad: () => null,
};

Layer.Graphic = Graphic;

export { Layer, Graphic };

export default Layer;
