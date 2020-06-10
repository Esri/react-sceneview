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
import { getGraphicFromLassoPoints } from './get-graphic-from-lasso-points';
import { handleSelectionQuery } from '../../helpers/handle-selection-query';

let listener;

class SelectionEventListener extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
    };
  }

  async componentDidMount() {
    listener = this.props.view.on('drag', async (event) => {
      event.stopPropagation();

      const screenPoint = { x: event.x, y: event.y };
      const mapPoint = this.props.view.toMap(screenPoint);

      const point = { screenPoint, mapPoint };

      switch (event.action) {
        case 'start': {
          if (!mapPoint) break;
          this.setState({
            points: [point],
          });
          break;
        }

        case 'update': {
          if (!mapPoint) break;
          this.setState({
            points: [...this.state.points, point],
          });
          this.updateSelectionGraphic(await this.getGraphic());
          break;
        }

        case 'end':
        default: {
          if (!mapPoint) {
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
    return getGraphicFromLassoPoints(this.state.points);
  }

  clearSelectionGraphic() {
    const selectionShapeLayer = this.props.view.map.layers.items.find(l => l.id === 'selection-shape');
    selectionShapeLayer.graphics.removeAll();
  }

  updateSelectionGraphic(graphic) {
    const selectionShapeLayer = this.props.view.map.layers.items.find(l => l.id === 'selection-shape');
    selectionShapeLayer.graphics.removeAll();
    selectionShapeLayer.graphics.add(graphic);
  }

  clearSelectionShape() {
    this.setState({
      points: [],
    });
    this.clearSelectionGraphic();
  }

  async doSelection(geometry, spatialRelationship, event) {
    const features = await handleSelectionQuery(this.props.view, geometry, spatialRelationship);

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
