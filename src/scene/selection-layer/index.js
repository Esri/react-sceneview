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

import selectionLayerSettings from './selection-layer-settings';


class SelectionLayer extends Component {
  async componentDidMount() {
    const [GraphicsLayer] = await esriLoader.loadModules(['esri/layers/GraphicsLayer']);

    this.props.view.map.add(new GraphicsLayer({
      id: this.props.id,
      ...selectionLayerSettings,
    }));
  }


  render() {
    return null;
  }
}


SelectionLayer.propTypes = {
  id: PropTypes.string.isRequired,
  view: PropTypes.object.isRequired,
};


export default SelectionLayer;