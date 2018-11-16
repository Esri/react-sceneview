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


class AreaMeasurementTool extends Component {
  async componentDidMount() {
    const [AreaMeasurement3DTool] = await esriLoader.loadModules([
      'esri/views/3d/interactive/measurementTools/areaMeasurement3D/AreaMeasurement3DTool',
    ]);

    measurementTool = new AreaMeasurement3DTool({ view: this.props.view, unit: this.props.unit });

    window.measurementTool = measurementTool;

    measurementTool.activate();

    watcher = measurementTool.watch('pathLength', () => {
      if (!measurementTool.area) return;

      this.props.onMeasure({
        area: measurementTool.area,
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

AreaMeasurementTool.propTypes = {
  onMeasure: PropTypes.func,
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object.isRequired,
};


AreaMeasurementTool.defaultProps = {
  unit: 'metric',
  onMeasure: () => null,
};


export default AreaMeasurementTool;