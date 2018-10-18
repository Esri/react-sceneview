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
  layerType: PropTypes.oneOf(['feature', 'scene', 'tile']).isRequired,
  visible: PropTypes.bool,
  definitionExpression: PropTypes.string,
  renderer: PropTypes.object,
  rendererJson: PropTypes.object,
  labelingInfo: PropTypes.object,
  labelsVisible: PropTypes.bool,
  outFields: PropTypes.arrayOf(PropTypes.string),
  elevationInfo: PropTypes.object,
  geometryType: PropTypes.string,
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
};


const getLayerSettings = (props) => {
  const settings = {};

  Object.keys(layerSettingsProps)
    .filter(key => props[key] !== null && props[key] !== undefined)
    .forEach(key => settings[key] = props[key]);

  return settings;
};


const getLayerUpdates = (props, nextProps) => {
  const updates = {};

  Object.keys(layerSettingsProps)
    .filter(key => props[key] !== nextProps[key])
    .forEach(key => updates[key] = nextProps[key]);

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
      scaleDependentRenderer: (props.renderer && props.renderer.type === 'scale-dependent') || false,
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
      scaleDependentEsriRenderers: null,
      scaleEventListener: null,
    };

    loadLayer(this.props.view, getLayerSettings(this.props)).then(async (result) => {
      this.setState(result);

      if (!this.state.layer) return;

      const {
        renderer,
        rendererJson,
        labelingInfoJson,
        source,
        ...updates
      } = getLayerSettings(this.props);

      Object.keys(updates).forEach(key => this.state.layer[key] = updates[key]);

      if (renderer) {
        if (renderer.type === 'scale-dependent') {
          this.calcScaleDependentRenderers(renderer.scaleDependentRenderers);
        } else {
          this.state.layer.renderer = renderer;
        }
      }

      if (rendererJson) {
        const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);
        this.state.layer.renderer = rendererJsonUtils.fromJSON(rendererJson);
      }

      if (this.props.selection && this.props.selection.length) {
        this.setState({ highlights: this.state.layerView.highlight(this.props.selection) });
      }

      if (this.props.zoomTo) {
        this.state.layer.when(() => this.props.view.goTo(this.state.layer.fullExtent));
      }
    });
  }


  async componentDidUpdate(prevProps) {
    if (!this.state.layer) return;

    // refresh layer
    if (this.props.refresh !== prevProps.refresh) {
      const layerView = this.state.layerView;
      layerView.refresh();
    }

    // update layer settings
    const {
      renderer,
      rendererJson,
      source,
      ...updates
    } = getLayerUpdates(prevProps, this.props);

    Object.keys(updates).forEach(key => this.state.layer[key] = updates[key]);

    if (renderer) {
      if (this.state.scaleEventListener) {
        this.state.scaleEventListener.remove();
      }

      if (renderer.type === 'scale-dependent') {
        this.calcScaleDependentRenderers(renderer.scaleDependentRenderers);
      } else {
        this.state.layer.renderer = renderer;
      }
    }

    if (rendererJson) {
      const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);
      this.state.layer.renderer = rendererJsonUtils.fromJSON(rendererJson);
    }

    // update source graphics
    if (this.props.source !== prevProps.source) {
      const newGraphics = this.props.source.filter(graphic => !prevProps.source.includes(graphic));
      const oldGraphics = prevProps.source.filter(graphic => !this.props.source.includes(graphic));

      if (oldGraphics.length > 0) {
        this.state.layer.source.removeAll();
        this.state.layer.source.addMany(this.props.source);
      } else {
        this.state.layer.source.addMany(newGraphics);
      }
    }

    // update zoomTo
    if (this.props.zoomTo && !prevProps.zoomTo) {
      this.state.layer.when(() => this.props.view.goTo(this.state.layer.fullExtent));
    }
  }

  componentWillUnmount() {
    if (!this.state.layer) return;

    if (this.state.layer.source && this.state.layer.source.removeAll) {
      this.state.layer.source.removeAll();
    }

    this.props.view.map.layers.remove(this.state.layer);
  }

  setScaleDependentRenderer() {
    const scale = this.props.view.scale;
    const renderer = this.state.scaleDependentEsriRenderers
      .find(i => scale <= i.maxScale && scale >= i.minScale);

    if (!renderer) {
      this.state.layer.renderer = null;
      return;
    }

    if (this.state.layer.renderer !== renderer.renderer) {
      this.state.layer.renderer = renderer.renderer;
    }
  }

  async calcScaleDependentRenderers(inputScaleDependentRenderers) {
    const [Renderer] = await esriLoader.loadModules(['esri/renderers/UniqueValueRenderer']);

    const scaleDependentEsriRenderers = inputScaleDependentRenderers
      .filter(({ renderer }) => renderer.type === 'unique-value') // should try to support all in the future
      .map(({ renderer: { type, ...renderer }, minScale, maxScale }) => ({
        renderer: new Renderer(renderer),
        minScale,
        maxScale,
      }));

    const scaleEventListener = this.props.view.watch('scale', () => {
      this.setScaleDependentRenderer();
    });

    this.setState({
      scaleDependentEsriRenderers,
      scaleEventListener,
    });

    this.setScaleDependentRenderer();
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
};

Layer.Graphic = Graphic;

export { Layer, Graphic };

export default Layer;