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
      groupLayer: null,
      groundLayer: null,
    };
  }

  componentDidMount() {
    this.componentIsMounted = true;
    this.loadWebscene();
  }

  componentDidUpdate(prevProps) {
    this.update(prevProps);
  }

  componentWillUnmount() {
    if (!this.props.view || !this.props.view.map) return;
    this.componentIsMounted = false;
    this.props.view.map.remove(this.state.groupLayer);
    this.props.view.map.ground.layers.remove(this.state.groundLayer);
  }

  update(prevProps = {}) {
    if (!this.props.view) return;

    if (prevProps.visible !== this.props.visible) {
      if (this.state.groupLayer) {
        this.state.groupLayer.visible = this.props.visible;
      }
      if (this.state.groundLayer) {
        this.state.groundLayer.visible = this.props.visible;
      }
    }

    if (prevProps.layerSettings !== this.props.layerSettings) {
      Object.keys(this.props.layerSettings).forEach(layerId => {
        const settings = this.props.layerSettings[layerId];
        const layer =
          this.state.groupLayer.layers.items.find(l => l.id === layerId) ||
          (this.state.groundLayer.id === layerId
            ? this.state.groundLayer
            : undefined);
        if (!layer) return;

        Object.keys(settings).forEach(
          field => (layer[field] = settings[field]),
        );
      });
    }
  }

  async loadWebscene() {
    if (!this.props.view || !this.props.view.map) return;

    const [
      EsriWebScene,
      EsriGroupLayer,
      EsriLayer,
    ] = await esriLoader.loadModules([
      'esri/WebScene',
      'esri/layers/GroupLayer',
      'esri/layers/Layer',
    ]);
    if (!this.componentIsMounted) return;

    const layers = [];
    let groundLayer;

    try {
      const webscene = new EsriWebScene({ portalItem: this.props.portalItem });
      await webscene.load();

      layers.push(...webscene.layers.items);

      if (this.props.ground) {
        // filter out the default 3D terrain and ground layers that are not visible
        const filteredGroundLayers = webscene.ground.layers.items.filter(
          l => l.title !== 'Terrain 3D' && l.visible,
        );
        // assign the first ground layer
        groundLayer = filteredGroundLayers[0];
      }
    } catch (err) {
      // if portal item turns out to be a layer instead of a webscene, don't care and add it anyway.
      try {
        const layer = await EsriLayer.fromPortalItem({
          portalItem: this.props.portalItem,
        });
        layers.push(layer);
      } catch (e) {
        // give up
      }
    }

    const groupLayer = new EsriGroupLayer({ visible: this.props.visible });

    if (!this.componentIsMounted) return;

    this.setState({ groupLayer });
    this.state.groupLayer.addMany(layers);
    this.props.view.map.layers.add(groupLayer);

    this.setState({ groundLayer });
    this.props.view.map.ground.layers.add(groundLayer);

    await this.props.view.whenLayerView(groupLayer);
    this.update();

    if (this.props.onLoad) {
      this.props.onLoad(
        this.state.groupLayer.layers.items,
        this.state.groupLayer.id,
        this.state.groundLayer,
      );
    }
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
  layerSettings: PropTypes.object,
  ground: PropTypes.bool,
};

Webscene.defaultProps = {
  view: null,
  visible: true,
  onLoad: null,
  layerSettings: {},
  ground: true,
};

export default Webscene;
