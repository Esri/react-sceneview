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
  }


  update(prevProps = {}) {
    if (!this.props.view || !this.state.groupLayer) return;

    if (prevProps.visible !== this.props.visible) {
      this.state.groupLayer.visible = this.props.visible;
    }

    if (prevProps.layerSettings !== this.props.layerSettings) {
      Object.keys(this.props.layerSettings).forEach(layerId => {
        const settings = this.props.layerSettings[layerId];
        const layer = this.state.groupLayer.layers.items.find(l => l.id === layerId);
        if (!layer) return;

        Object.keys(settings).forEach(field => layer[field] = settings[field]);
      });
    }
  }


  async loadWebscene() {
    if (!this.props.view || !this.props.view.map) return;

    const [EsriWebScene, EsriGroupLayer, EsriLayer] = await esriLoader.loadModules([
      'esri/WebScene',
      'esri/layers/GroupLayer',
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

    const groupLayer = new EsriGroupLayer({ visible: this.props.visible });

    if (!this.componentIsMounted) return;

    this.setState({ groupLayer });
    this.state.groupLayer.addMany(layers);
    this.props.view.map.layers.add(groupLayer);

    await this.props.view.whenLayerView(groupLayer);
    this.update();

    if (this.props.onLoad) this.props.onLoad(this.state.groupLayer.layers.items);
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
};


Webscene.defaultProps = {
  view: null,
  visible: true,
  onLoad: null,
  layerSettings: {},
};


export default Webscene;
