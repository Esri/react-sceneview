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


class ClickEventListener extends Component {
  async componentDidMount() {
    listener = this.props.view.on('click', async (event) => {
      const { results, screenPoint } = await this.props.view.hitTest({ x: event.x, y: event.y });

      const graphic = results && results[0] && results[0].graphic;
      const mapPoint = this.props.view.toMap(screenPoint);


      let features = [];
      if (mapPoint) {
        try {
          const circle = await getSelectionGeometry(mapPoint);

          features = await handleSelectionQuery(
            this.props.view,
            circle,
            'esriSpatialRelIntersects',
          );
        } catch (err) {
          // do nothing
        }
      }

      this.props.onClick({
        mapPoint,
        graphic: graphic && graphic.layer && graphic.layer.selectable ? {
          attributes: graphic.attributes,
          geometry: graphic.geometry,
          GlobalID: graphic.attributes.GlobalID,
          objectId: graphic.attributes[graphic.layer.objectIdField],
          layerId: graphic.layer && graphic.layer.id,
        } : null,
        features: features.slice(0, 1),
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
  view: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};


ClickEventListener.defaultProps = {
  view: null,
};


export default ClickEventListener;
