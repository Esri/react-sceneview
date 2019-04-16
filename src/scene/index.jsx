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

import Layer, { Graphic } from './layer';
import Ground from './ground';
import CustomBasemap from './custom-basemap';
import CustomElevationLayer from './custom-elevation-layer';
import SelectionLayer from './selection-layer';


class Scene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webscene: null,
    };

    this.loadWebscene();
  }

  async loadWebscene() {
    if (!this.props.view.map) {
      const [WebScene] = await esriLoader.loadModules(['esri/WebScene']);

      const webscene = new WebScene({
        portalItem: this.props.portalItem,
        basemap: this.props.basemap,
        ground: this.props.ground,
        initialViewProperties: this.props.initialViewProperties,
      });

      await webscene.load();

      this.props.view.map = webscene;
    }

    await this.props.view.when();

    this.setState({ webscene: this.props.view.map });

    if (this.props.onLoad) this.props.onLoad(this.props.view.map);
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
          selectionQuery: this.props.selectionQuery,
        });
      }

      return React.cloneElement(child, {
        view: this.props.view,
        selectionQuery: this.props.selectionQuery,
      });
    });
  }


  render() {
    return this.state.webscene && this.props.view && (
      <div id="scene">
        {this.renderWrappedChildren(this.props.children)}
        <SelectionLayer id="selection-shape" view={this.props.view} />
      </div>
    );
  }
}


Scene.propTypes = {
  children: PropTypes.node,
  portalItem: PropTypes.object,
  basemap: PropTypes.string,
  ground: PropTypes.string,
  initialViewProperties: PropTypes.object,
  view: PropTypes.object.isRequired,
  selectionQuery: PropTypes.object,
  onLoad: PropTypes.func,
};

Scene.defaultProps = {
  children: null,
  portalItem: null,
  basemap: 'gray-vector',
  ground: 'world-elevation',
  initialViewProperties: null,
  selectionQuery: null,
  onLoad: null,
  onView: null,
};

Scene.Layer = Layer;
Scene.CustomBasemap = CustomBasemap;
Scene.CustomElevationLayer = CustomElevationLayer;

export { Scene, Layer, Ground, Graphic, CustomBasemap, CustomElevationLayer };

export default Scene;
