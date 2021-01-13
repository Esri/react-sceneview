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

import { Component } from 'react';
import PropTypes from 'prop-types';
import esriLoader from 'esri-loader';

class CustomBasemap extends Component {
  componentDidMount() {
    this.loadBasemap();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.portalItem !== prevProps.portalItem ||
      this.props.basemap !== prevProps.basemap
    ) {
      this.loadBasemap();
    }
  }

  componentWillUnmount() {
    this.props.view.map.basemap = 'gray-vector';
  }

  async loadBasemap() {
    if (this.props.portalItem) {
      const [Basemap] = await esriLoader.loadModules(['esri/Basemap']);
      this.props.view.map.basemap = new Basemap({
        portalItem: this.props.portalItem,
      });
    } else {
      this.props.view.map.basemap = this.props.basemap;
    }
  }

  render() {
    return null;
  }
}

CustomBasemap.propTypes = {
  basemap: PropTypes.string,
  portalItem: PropTypes.object,
  view: PropTypes.object,
};

CustomBasemap.defaultProps = {
  basemap: 'gray-vector',
  portalItem: null,
  view: null,
};

export default CustomBasemap;
