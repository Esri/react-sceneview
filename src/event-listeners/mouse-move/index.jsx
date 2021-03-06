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

let listener;

class MouseMoveEventListener extends Component {
  async componentDidMount() {
    listener = this.props.view.on('pointer-move', async event => {
      // don't trigger while navigating the scene
      if (this.props.view.interacting) return;

      const { results } = await this.props.view.hitTest({
        x: event.x,
        y: event.y,
      });

      const graphic = results && results[0] && results[0].graphic;
      const mapPoint = this.props.view.toMap({ x: event.x, y: event.y });

      if (graphic && graphic.layer && graphic.layer.selectable) {
        this.props.onMouseMove({
          graphic,
          GlobalID: graphic.attributes.GlobalID,
          objectId: graphic.attributes[graphic.layer.objectIdField],
          layerId: graphic.layer && graphic.layer.id,
          event,
          mapPoint,
        });
      } else {
        this.props.onMouseMove({
          graphic: null,
          event,
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

MouseMoveEventListener.propTypes = {
  view: PropTypes.object,
  onMouseMove: PropTypes.func.isRequired,
};

MouseMoveEventListener.defaultProps = {
  view: null,
};

export default MouseMoveEventListener;
