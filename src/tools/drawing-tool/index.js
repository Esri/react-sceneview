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
import esriLoader from 'esri-loader';


let measurementTool;
let watcher;


class DrawingTool extends Component {
  async componentDidMount() {
    const [AreaMeasurement3DTool] = await esriLoader.loadModules([
      'esri/views/3d/interactive/measurementTools/areaMeasurement3D/AreaMeasurement3DTool',
    ]);

    measurementTool = new AreaMeasurement3DTool({ view: this.props.view, unit: 'metric' });

    window.measurementTool = measurementTool;

    measurementTool.activate();

    watcher = measurementTool.watch('pathLength', () => {
      const screenPoint = measurementTool.model.path &&
        measurementTool.model.path.vertices.items.length &&
        this.props.view.toScreen(measurementTool.model.path.vertices.items.slice(-1)[0]);

      if (!screenPoint) return;

      this.props.onDraw({
        geometry: {
          points:
            measurementTool.model.path.vertices.items.map(({ latitude, longitude, x, y, z }) => ({
              latitude,
              longitude,
              x,
              y,
              z,
            })),
          spatialReference: measurementTool.model.path.vertices.items[0].spatialReference,
        },
        area: measurementTool.area,
        validMeasurement: measurementTool.validMeasurement,
        screenPoint: screenPoint ? {
          x: screenPoint.x,
          y: screenPoint.y,
        } : null,
      });
    });
  }

  componentWillUnmount() {
    if (watcher) watcher.remove();
    if (measurementTool) measurementTool.deactivate();
  }

  render() {
    return null;
  }
}


DrawingTool.propTypes = {
  onDraw: PropTypes.func,
  view: PropTypes.object.isRequired,
};


DrawingTool.defaultProps = {
  onDraw: () => null,
};


export default DrawingTool;
