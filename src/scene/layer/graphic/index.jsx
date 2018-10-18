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


class Graphic extends Component {
  componentDidMount() {
    this.loadGraphic();
  }

  componentDidUpdate(prevProps) {
    const objectId = prevProps.attributes[this.props.layer.objectIdField];
    this.destroyGraphic(objectId);
    this.loadGraphic();
  }

  componentWillUnmount() {
    this.destroyGraphic();
  }

  loadGraphic() {
    const { geometry, attributes, symbol } = this.props;
    this.objectId = attributes[this.props.layer.objectIdField];
    this.props.layer.graphics.add({ geometry, attributes, symbol });
  }

  destroyGraphic() {
    if (this.objectId) {
      const graphic = this.props.layer.graphics
        .find(i => i.attributes[this.props.layer.objectIdField] === this.objectId);
      if (graphic) {
        this.props.layer.graphics.remove(graphic);
      }
    }
  }

  render() {
    return null;
  }
}


Graphic.propTypes = {
  layer: PropTypes.object.isRequired,
  geometry: PropTypes.object.isRequired,
  attributes: PropTypes.array.isRequired,
  symbol: PropTypes.object,
};


Graphic.defaultProps = {
  symbol: null,
};


export default Graphic;
