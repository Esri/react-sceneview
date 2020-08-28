/* Copyright 2020 Esri
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

import esriLoader from 'esri-loader';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { handleSelectionQuery } from '../../helpers/handle-selection-query';

let listener;

class FeatureSelectionEventListener extends Component {
  async componentDidMount() {
    listener = this.props.view.on('click', async (event) => {
      const { results } = await this.props.view.hitTest({ x: event.x, y: event.y });

      if (!results) return;

      const graphics = results
        .map(result => result.graphic)
        .filter(graphic => graphic.layer && !graphic.layer.selectable)
        .filter(graphic => graphic.geometry)
        .filter(graphic => graphic.geometry.type === 'polygon');

      if (!graphics.length || !graphics[0].geometry) {
        this.props.onSelect({
          graphics: [],
          features: [],
          event,
        });
        return;
      }

      const [{ geometry }] = graphics;

      const [geometryEngine] = await esriLoader.loadModules(['esri/geometry/geometryEngine']);

      const intersectGeometry = geometryEngine.geodesicBuffer(geometry, -0.5, 'meters');

      const features = await handleSelectionQuery(
        this.props.view,
        intersectGeometry,
        'esriSpatialRelIntersects',
      );

      this.props.onSelect({
        graphics: [],
        features,
        event,
      });
    });
  }

  componentWillUnmount() {
    listener.remove();
  }

  render() {
    return null;
  }
}

FeatureSelectionEventListener.propTypes = {
  view: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

FeatureSelectionEventListener.defaultProps = {
  view: null,
};

export default FeatureSelectionEventListener;
