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
import esriLoader from 'esri-loader';
import unitOptions from '../../helpers/unit-options';


class AreaMeasurementTool extends Component {
  async componentDidMount() {
    const [AreaMeasurement3DTool] = await esriLoader.loadModules([
      'esri/widgets/AreaMeasurement3D',
    ]);

    this.measurementTool = new AreaMeasurement3DTool({
      view: this.props.view,
      unit: this.props.unit,
    });

    this.measurementTool.viewModel.newMeasurement();

    this.watcher = this.measurementTool.view.on('click', () => {
      if (this.measurementTool.viewModel.measurement.area.state === 'available') {
        this.props.onChange(this.measurementTool.viewModel.measurement);
      }
    });
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.remove();
    if (this.measurementTool) this.measurementTool.destroy();
  }

  render() {
    return null;
  }
}

AreaMeasurementTool.propTypes = {
  onChange: PropTypes.func,
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object,
};

AreaMeasurementTool.defaultProps = {
  onChange: () => null,
  unit: 'metric',
  view: null,
};


export default AreaMeasurementTool;
