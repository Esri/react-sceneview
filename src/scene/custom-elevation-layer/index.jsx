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

import { Component } from 'react';
import PropTypes from 'prop-types';
import esriLoader from 'esri-loader';


class CustomElevationLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layer: null,
    };

    this.loadBasemap();
  }

  async loadBasemap() {
    const [ElevationLayer] = await esriLoader.loadModules(['esri/layers/ElevationLayer']);
    this.setState({ layer: new ElevationLayer({ url: this.props.url }) });
    this.props.view.map.ground.layers.add(this.state.layer);
  }

  render() {
    return null;
  }
}


CustomElevationLayer.propTypes = {
  url: PropTypes.string.isRequired,
  view: PropTypes.object.isRequired,
};


export default CustomElevationLayer;
