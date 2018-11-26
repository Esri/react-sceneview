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
import unitOptions from '../../helpers/unit-options';


let measurementTool;
let watcher;


class DistanceMeasurementTool extends Component {
  async componentDidMount() {
    const [DirectLineMeasurement3D] = await esriLoader.loadModules([
      'esri/views/3d/interactive/measurementTools/directLineMeasurement3D/DirectLineMeasurement3DTool',
    ]);

    measurementTool = new DirectLineMeasurement3D({ view: this.props.view, unit: this.props.unit });

    window.measurementTool = measurementTool;

    measurementTool.start();

    watcher = measurementTool.watch('directDistance', () => {
      this.props.onMeasure({
        directDistance: measurementTool.directDistance,
        horizontalDistance: measurementTool.horizontalDistance,
        verticalDistance: measurementTool.verticalDistance,
      });
    });
  }

  componentWillUnmount() {
    if (watcher) watcher.remove();
    if (measurementTool) measurementTool.stop();
  }

  render() {
    return null;
  }
}

DistanceMeasurementTool.propTypes = {
  onMeasure: PropTypes.func,
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object.isRequired,
};


DistanceMeasurementTool.defaultProps = {
  unit: 'metric',
  onMeasure: () => null,
};


export default DistanceMeasurementTool;
