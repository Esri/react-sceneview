/* Copyright 2019 Esri
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

import Layer, { Graphic } from './layer';
// import Webscene from './webscene';
import Ground from './ground';
import CustomBasemap from './custom-basemap';
import CustomElevationLayer from './custom-elevation-layer';
import SelectionLayer from './selection-layer';


class Scene extends Component {
  constructor(props) {
    super(props);
    this.state = { mapLoaded: false };
  }

  componentDidMount() {
    this.loadMap();
  }

  async loadMap() {
    const {
      basemap,
      ground,
      initialViewProperties,
      view,
      onLoad,
    } = this.props;

    const [WebScene] = await esriLoader.loadModules(['esri/WebScene']);
    const newMap = new WebScene({ basemap, ground, initialViewProperties });
    await newMap.load();

    view.map = newMap;
    await view.when();

    this.setState({ mapLoaded: true });

    if (this.props.onLoad) onLoad(view.map);
  }

  renderWrappedChildren(children) {
    if (!children) return null;

    return React.Children.map(children, (child) => {
      // This is support for non-node elements (eg. pure text), they have no props
      if (!child || !child.props) {
        return child;
      }

      if (child.props.children) {
        return React.cloneElement(child, {
          children: this.renderWrappedChildren(child.props.children),
          view: this.props.view,
          // selectionQuery,
        });
      }

      return React.cloneElement(child, { view: this.props.view,
        // selectionQuery,
      });
    });
  }

  render() {
    const {
      children,
      view,
      // selectionQuery,
    } = this.props;

    return view && this.state.mapLoaded && (
      <div id="scene">
        {this.renderWrappedChildren(children)}
        <SelectionLayer id="selection-shape" view={view} />
      </div>
    );
  }
}


Scene.propTypes = {
  children: PropTypes.node,
  basemap: PropTypes.string,
  ground: PropTypes.string,
  initialViewProperties: PropTypes.object,
  view: PropTypes.object,
  // selectionQuery: PropTypes.object,
  onLoad: PropTypes.func,
};

Scene.defaultProps = {
  children: null,
  basemap: 'gray-vector',
  ground: 'world-elevation',
  initialViewProperties: null,
  view: null,
  // selectionQuery: null,
  onLoad: null,
};

Scene.Layer = Layer;
Scene.CustomBasemap = CustomBasemap;
Scene.CustomElevationLayer = CustomElevationLayer;

export { Scene, Layer, Ground, Graphic, CustomBasemap, CustomElevationLayer };

export default Scene;
