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

class Zoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: null,
    };

    this.loadZoom();
  }

  componentDidUpdate() {
    this.props.view.ui.move(this.state.zoom, this.props.position);
  }

  componentWillUnmount() {
    this.props.view.ui.remove(this.state.zoom);
  }

  async loadZoom() {
    const [EsriZoom] = await esriLoader.loadModules(['esri/widgets/Zoom']);

    this.setState({
      zoom: new EsriZoom({
        view: this.props.view,
        layout: this.props.layout,
      }),
    });

    this.props.view.ui.add(this.state.zoom, this.props.position);
  }

  render() {
    return null;
  }
}

Zoom.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-right', 'bottom-left']),
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  view: PropTypes.object,
};

Zoom.defaultProps = {
  position: 'top-left',
  layout: 'vertical',
  view: null,
};

export default Zoom;
