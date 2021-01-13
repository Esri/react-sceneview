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
import { getGraphicFromRectangle } from './get-graphic-from-rectangle';
import { handleSelectionQuery } from '../../helpers/handle-selection-query';

let listener;

class SelectionEventListener extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startPoint: null,
      endPoint: null,
      points: [],
      heading: 0,
    };
  }

  async componentDidMount() {
    listener = this.props.view.on('drag', async event => {
      event.stopPropagation();

      const screenPoint = { x: event.x, y: event.y };
      const mapPoint = this.props.view.toMap(screenPoint);
      const point = { screenPoint, mapPoint };

      switch (event.action) {
        case 'start': {
          if (!point.mapPoint) break;
          this.setState({
            startPoint: point,
            points: [point],
            heading: this.props.view.camera.heading,
          });
          break;
        }

        case 'update': {
          if (!this.state.startPoint || !point.mapPoint) break;
          this.setState({
            endPoint: point,
            points: [...this.state.points, point],
            heading: this.props.view.camera.heading,
          });

          this.updateSelectionGraphic(await this.getGraphic());

          break;
        }

        case 'end':
        default: {
          if (!this.state.startPoint || !this.state.endPoint) {
            this.clearSelectionShape();
            break;
          }

          const { geometry, spatialRelationship } = await this.getGraphic();
          this.clearSelectionShape();
          this.doSelection(geometry, spatialRelationship, event);
          break;
        }
      }
    });
  }

  componentWillUnmount() {
    listener.remove();
  }

  getGraphic() {
    return getGraphicFromRectangle(
      this.state.startPoint,
      this.state.endPoint,
      this.state.heading,
    );
  }

  clearSelectionGraphic() {
    const selectionShapeLayer = this.props.view.map.layers.items.find(
      l => l.id === 'selection-shape',
    );
    selectionShapeLayer.graphics.removeAll();
  }

  updateSelectionGraphic(graphic) {
    const selectionShapeLayer = this.props.view.map.layers.items.find(
      l => l.id === 'selection-shape',
    );
    selectionShapeLayer.graphics.removeAll();
    selectionShapeLayer.graphics.add(graphic);
  }

  clearSelectionShape() {
    this.setState({
      startPoint: null,
      endPoint: null,
      points: [],
    });
    this.clearSelectionGraphic();
  }

  async doSelection(geometry, spatialRelationship, event) {
    const features = await handleSelectionQuery(
      this.props.view,
      geometry,
      spatialRelationship,
    );

    this.props.onSelect({
      features,
      event: { ...event, geometry, spatialRelationship },
    });
  }

  render() {
    return null;
  }
}

SelectionEventListener.propTypes = {
  view: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

SelectionEventListener.defaultProps = {
  view: null,
};

export default SelectionEventListener;
