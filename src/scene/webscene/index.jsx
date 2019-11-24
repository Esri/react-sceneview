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


class Webscene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
    };
  }


  componentDidMount() {
    this.componentIsMounted = true;
    this.loadWebscene();
  }


  componentDidUpdate(prevProps) {
    if (this.props.visible !== prevProps.visible) {
      this.state.layers.forEach(layer => layer.visible = this.props.visible);
    }
  }


  componentWillUnmount() {
    this.componentIsMounted = false;
    if (!this.props.view || !this.props.view.map) return;
    this.props.view.map.removeMany(this.state.layers);
  }


  async loadWebscene() {
    if (!this.props.view || !this.props.view.map) return;

    const [EsriWebScene, EsriLayer] = await esriLoader.loadModules([
      'esri/WebScene',
      'esri/layers/Layer',
    ]);
    if (!this.componentIsMounted) return;

    const layers = [];

    try {
      const webscene = new EsriWebScene({ portalItem: this.props.portalItem });
      await webscene.load();

      layers.push(...webscene.layers.items);
    } catch (err) {
      // if portal item turns out to be a layer instead of a webscene, don't care and add it anyway.
      try {
        const layer = await EsriLayer.fromPortalItem({ portalItem: this.props.portalItem });
        layers.push(layer);
      } catch (e) {
        // give up
      }
    }
    layers.forEach(layer => layer.visible = this.props.visible);

    if (!this.componentIsMounted) return;

    this.setState({ layers });
    this.props.view.map.layers.addMany(layers);

    await Promise.all(layers.map(layer => this.props.view.whenLayerView(layer)));
    layers.forEach(layer => layer.visible = this.props.visible);

    if (this.props.onLoad) this.props.onLoad(this.state.layers);
  }

  render() {
    return <div />;
  }
}


Webscene.propTypes = {
  portalItem: PropTypes.object.isRequired,
  view: PropTypes.object,
  visible: PropTypes.bool,
  onLoad: PropTypes.func,
};


Webscene.defaultProps = {
  view: null,
  visible: true,
  onLoad: null,
};


export default Webscene;
