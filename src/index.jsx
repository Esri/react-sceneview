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

import getEsriGeometry from './helpers/get-esri-geometry';
import Scene, { Layer, Ground, Graphic } from './scene';
import UI from './ui';
import EventListeners from './event-listeners';
import Legend from './legend';

import DrawingTool from './tools/drawing-tool';
import LineSelectionTool from './tools/line-selection-tool';
import RectangleSelectionTool from './tools/rectangle-selection-tool';
import LassoSelectionTool from './tools/lasso-selection-tool';
import DistanceMeasurementTool from './tools/distance-measurement-tool';
import AreaMeasurementTool from './tools/area-measurement-tool';
import SliceTool from './tools/slice-tool';


import { loadEsriSceneView } from './load';


const getCameraFromProp = async (current, { center, position, heading, tilt, scale, target }) => {
  const camera = {};
  if (position && current.position !== position) camera.position = position;
  if (center && current.center !== center) camera.center = center;
  if (heading && current.heading !== heading) camera.heading = heading;
  if (tilt && current.tilt !== tilt) camera.tilt = tilt;
  if (scale) camera.scale = scale;
  if (target) camera.target = await getEsriGeometry(target);
  return camera;
};

let animation;


class SceneView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: (window.sceneViews && window.sceneViews[this.props.id] &&
        window.sceneViews[this.props.id].view) || null,
      selectionQuery: null,
    };
  }

  componentDidMount() {
    if (window.sceneViews && window.sceneViews[this.props.id]) {
      this.componentRef.appendChild(window.sceneViews[this.props.id].container);
      return;
    }

    this.loadSceneView();
  }

  async UNSAFE_componentWillUpdate(nextProps) { // eslint-disable-line camelcase
    if (this.props.environment !== nextProps.environment) {
      const environment = this.parseEnvironment(nextProps.environment);
      Object.keys(environment).forEach(key => this.state.view.environment[key] = {
        ...this.state.view.environment[key],
        ...environment[key],
      });
    }

    if (this.props.qualityProfile !== nextProps.qualityProfile) {
      this.state.view.qualityProfile = nextProps.qualityProfile;
    }

    if (this.props.padding !== nextProps.padding) {
      this.state.view.padding = nextProps.padding;
    }

    if (this.props.goTo !== nextProps.goTo) {
      const camera = await getCameraFromProp(this.props.goTo, nextProps.goTo);
      if (Object.keys(camera).length > 0 && !this.state.view.interacting) {
        this.state.view.goTo(camera);
      }
    }

    if (this.props.goToLayers !== nextProps.goToLayers &&
      nextProps.goToLayers && nextProps.goToLayers.length > 0) {
      const layers = nextProps.goToLayers
        .map(id => this.state.view.map.layers.items.find(i => i.id === id))
        .filter(layer => layer);

      const extentResults = await Promise.all(layers.map(layer => layer.queryExtent()));
      const extents = extentResults
        .filter(({ count }) => count > 0)
        .map(({ extent }) => extent);

      this.state.view.goTo(extents);
    }

    /* TODO: add this to initialization */
    if (this.props.turntable !== nextProps.turntable) {
      if (animation) animation.remove();

      if (this.state.view.interacting) return;
      if (!nextProps.turntable || !nextProps.turntable.target) return;

      const camera = await getCameraFromProp(this.props.turntable, nextProps.turntable);
      await this.state.view.goTo(camera);

      const [scheduling, watchUtils] =
        await esriLoader.loadModules(['esri/core/scheduling', 'esri/core/watchUtils']);

      const view = this.state.view;
      const target = nextProps.turntable.target;

      animation = scheduling.addFrameTask({
        update: () => {
          try {
            view.goTo({
              target,
              heading: view.camera.heading + 0.2,
            }, { animation: false });
          } catch (err) {
            // do nothing
          }
        },
      });

      // on user interaction
      watchUtils.whenOnce(this.state.view, 'interacting', () => {
        if (!animation) return;

        animation.remove();

        // dispatch latest camera
        if (this.props.onCameraChange) {
          this.props.onCameraChange(this.state.view.camera);
        }
      });
    }

    if (this.props.highlightOptions !== nextProps.highlightOptions) {
      this.state.view.highlightOptions = nextProps.highlightOptions;
    }
  }

  getGeometry(layerId, id) {
    if (!this.state.view || !this.state.view.layerViews) return null;

    const layerView = this.state.view.layerViews.items.find(e => e.layer.id === layerId);
    if (!layerView) return null;
    const { objectIdField } = layerView.layer;

    const graphic = layerView.controller.graphics
      .find(e => e.attributes.GlobalID === id || e.attributes[objectIdField] === id);
    if (!graphic) return null;

    // TODO: this dirty hack needs improvement
    // TODO: need to find a better way to parse Float64Arrays into Arrays
    return {
      ...graphic.geometry,
      rings: graphic.geometry.rings.map(ring =>
        ring.map(point => [point[0], point[1], point[3]]),
      ),
    };
  }


  openPopup(params) {
    this.state.view.popup.open(params);
  }

  closePopup() {
    this.state.view.popup.close();
  }

  parseEnvironment(inputEnvironment) {
    const { lighting: { utcDate, ...lighting }, ...environment } = inputEnvironment;
    environment.lighting = lighting;

    if (utcDate) {
      const { hours, minutes, seconds } =
        this.state.view.environment.lighting.positionTimezoneInfo;

      const newDate = new Date(utcDate);
      newDate.setUTCHours(utcDate.getUTCHours() - hours);
      newDate.setUTCMinutes(utcDate.getUTCMinutes() - minutes);
      newDate.setUTCSeconds(utcDate.getUTCSeconds() - seconds);
      environment.lighting.date = newDate;
    }
    return environment;
  }

  async loadSceneView() {
    const viewSettings = {
      qualityProfile: this.props.qualityProfile,
      padding: this.props.padding,
      popup: this.props.popup,
    };
    if (this.props.goTo) viewSettings.camera = this.props.goTo;
    const view = await loadEsriSceneView(this.componentRef, this.props.id, viewSettings);

    if (this.props.highlightOptions) view.highlightOptions = this.props.highlightOptions;

    this.setState({ view });
    if (this.props.onLoad) this.props.onLoad(view);
  }

  render() {
    return (
      <div
        id="sceneview"
        style={{ width: '100%', height: '100%' }}
        ref={(ref) => { this.componentRef = ref; }}
      >
        {this.state.view && this.props.children &&
          React.Children.map(this.props.children,
            child => child && React.cloneElement(child, {
              ...this.state,
            }))}
        {this.state.view && this.props.onCameraChange &&
          !(this.props.turntable && this.props.turntable.target) &&
          <EventListeners.Camera
            view={this.state.view}
            onCameraChange={this.props.onCameraChange}
          />}
        {this.state.view && this.props.onClick && <EventListeners.Click
          view={this.state.view}
          onClick={this.props.onClick}
        />}
        {this.state.view && this.props.onMouseMove && <EventListeners.MouseMove
          view={this.state.view}
          onMouseMove={this.props.onMouseMove}
        />}
      </div>
    );
  }
}


SceneView.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
  environment: PropTypes.object,
  highlightOptions: PropTypes.object,
  qualityProfile: PropTypes.oneOf(['low', 'medium', 'high']),
  padding: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  goTo: PropTypes.object,
  goToLayers: PropTypes.object,
  turntable: PropTypes.object,
  popup: PropTypes.object,
  onCameraChange: PropTypes.func,
  onClick: PropTypes.func,
  onMouseMove: PropTypes.func,
  onLoad: PropTypes.func,
};


SceneView.defaultProps = {
  children: null,
  environment: null,
  highlightOptions: null,
  qualityProfile: 'medium',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  goTo: null,
  goToLayers: null,
  turntable: null,
  popup: null,
  onCameraChange: () => null,
  onClick: null,
  onMouseMove: null,
  onLoad: null,
};


SceneView.Scene = Scene;
SceneView.UI = UI;
SceneView.DrawingTool = DrawingTool;
SceneView.LineSelectionTool = LineSelectionTool;
SceneView.RectangleSelectionTool = RectangleSelectionTool;
SceneView.LassoSelectionTool = LassoSelectionTool;
SceneView.DistanceMeasurementTool = DistanceMeasurementTool;
SceneView.AreaMeasurementTool = AreaMeasurementTool;
SceneView.SliceTool = SliceTool;

export {
  SceneView,
  Scene,
  Layer,
  Ground,
  Graphic,
  UI,
  Legend,
  DrawingTool,
  LineSelectionTool,
  RectangleSelectionTool,
  LassoSelectionTool,
  DistanceMeasurementTool,
  AreaMeasurementTool,
  SliceTool,
};

export default SceneView;
