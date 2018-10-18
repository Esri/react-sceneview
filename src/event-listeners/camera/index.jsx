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

let listener;

class CameraEventListener extends Component {
  componentDidMount() {
    listener = this.props.view.watch('stationary', () => {
      if (this.props.view.stationary) {
        this.props.onCameraChange({
          position: this.props.view.camera.position,
          heading: this.props.view.camera.heading,
          tilt: this.props.view.camera.tilt,
          scale: this.props.view.scale,
        });
      }
    });
  }

  componentWillUnmount() {
    listener.remove();
  }

  render() {
    return null;
  }
}


CameraEventListener.propTypes = {
  view: PropTypes.object.isRequired,
  onCameraChange: PropTypes.func.isRequired,
};


export default CameraEventListener;
