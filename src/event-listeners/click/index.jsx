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

import esriLoader from 'esri-loader';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { handleSelectionQuery } from '../../helpers/handle-selection-query';


let listener;


const getSelectionGeometry = async (center) => {
  const [Circle] = await esriLoader.loadModules(['esri/geometry/Circle']);
  return new Circle({
    center,
    radius: 1,
  });
};


const getFeatureByGraphic = async (view, graphic) => {
  if (!graphic) return null;

  const layerView = view.layerViews.items.find(e => e.layer.id === graphic.layer.id);
  const layerFeatures = await layerView.queryFeatures({
    objectIds: [graphic.attributes[graphic.layer.objectIdField]],
  });

  return layerFeatures.length > 0 ? layerFeatures[0] : null;
};


const calcDistance2 = (feature1, feature2) => {
  if (!feature1.geometry || !feature2.geometry) return 0;
  const point1 = feature1.geometry.extent.center;
  const point2 = feature2.geometry.extent.center;
  return ((point1.x - point2.x) ** 2) + ((point1.y - point2.y) ** 2);
};


const calcNearestFeature = (features, targetFeature) => {
  const sortedFeatures = features.sort((a, b) =>
    (calcDistance2(a, targetFeature) > calcDistance2(b, targetFeature) ? 1 : -1));
  return sortedFeatures.slice(0, 1)[0];
};


class ClickEventListener extends Component {
  async componentDidMount() {
    listener = this.props.view.on('click', async (event) => {
      const { results } = await this.props.view.hitTest({ x: event.x, y: event.y });
      if (!results || !results[0]) return;

      const graphic = results[0].graphic;
      const mapPoint = results[0].mapPoint;

      if (graphic && !graphic.geometry) {
        try {
          const resultFeature = await getFeatureByGraphic(this.props.view, graphic);
          graphic.geometry = resultFeature.geometry;
        } catch (err) {
          // do nothing
        }
      }

      let features = [];
      let nearestFeature;
      if (mapPoint) {
        try {
          const circle = await getSelectionGeometry(mapPoint);

          features = await handleSelectionQuery(
            this.props.view,
            circle,
            'esriSpatialRelIntersects',
          );

          if (features.length > 1 && graphic && graphic.geometry) {
            nearestFeature = calcNearestFeature(features, graphic);
          }
        } catch (err) {
          // do nothing
        }
      }

      this.props.onClick({
        mapPoint,
        graphic: graphic && graphic.layer.selectable ? {
          attributes: graphic.attributes,
          geometry: graphic.geometry,
          GlobalID: graphic.attributes.GlobalID,
          objectId: graphic.attributes[graphic.layer.objectIdField],
          layerId: graphic.layer.id,
        } : null,
        features: nearestFeature ? [nearestFeature] : features.slice(0, 1),
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


ClickEventListener.propTypes = {
  view: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default ClickEventListener;
