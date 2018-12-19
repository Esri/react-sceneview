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


const ChildComponents = [Scene, DrawingTool, LineSelectionTool, RectangleSelectionTool,
  LassoSelectionTool, DistanceMeasurementTool, AreaMeasurementTool, SliceTool,
  ...Object.keys(UI).map(key => UI[key])];


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

  async componentWillUpdate(nextProps) {
    if (this.props.environment !== nextProps.environment) {
      const environment = this.parseEnvironment(nextProps.environment);
      Object.keys(environment).forEach(key => this.state.view.environment[key] = {
        ...this.state.view.environment[key],
        ...environment[key],
      });
    }

    if (this.props.goTo !== nextProps.goTo) {
      const camera = await getCameraFromProp(this.props.goTo, nextProps.goTo);
      if (Object.keys(camera).length > 0 && !this.state.view.interacting) {
        this.state.view.goTo(camera);
      }
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
    const viewSettings = {};
    if (this.props.goTo) viewSettings.camera = this.props.goTo;
    const view = await loadEsriSceneView(this.componentRef, this.props.id, viewSettings);

    if (this.props.highlightOptions) view.highlightOptions = this.props.highlightOptions;

    this.setState({ view });
  }

  render() {
    return (
      <div
        id="sceneview"
        style={{ width: '100%', height: '100%' }}
        ref={(ref) => { this.componentRef = ref; }}
      >
        {this.state.view &&
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
  id: PropTypes.string.isRequired,
  environment: PropTypes.object,
  highlightOptions: PropTypes.object,
  goTo: PropTypes.object,
  turntable: PropTypes.object,
  onCameraChange: PropTypes.func,
  onClick: PropTypes.func,
  onMouseMove: PropTypes.func,
};


SceneView.defaultProps = {
  children: [],
  environment: null,
  highlightOptions: null,
  goTo: null,
  turntable: null,
  onCameraChange: () => null,
  onClick: null,
  onMouseMove: null,
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
