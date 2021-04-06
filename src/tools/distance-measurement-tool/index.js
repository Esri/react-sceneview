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

import { Component } from 'react';
import PropTypes from 'prop-types';
import esriLoader from 'esri-loader';
import unitOptions from '../../helpers/unit-options';

class DistanceMeasurementTool extends Component {
  async componentDidMount() {
    this.componentIsMounted = true;

    const [DirectLineMeasurement3D] = await esriLoader.loadModules([
      'esri/widgets/DirectLineMeasurement3D',
    ]);
    if (!this.componentIsMounted) return;

    this.measurementTool = new DirectLineMeasurement3D({
      view: this.props.view,
      unit: this.props.unit,
    });

    await this.measurementTool.viewModel.start();

    this.watcher = this.measurementTool.view.on('pointer-move', () => {
      if (
        this.props.onChange &&
        this.measurementTool.viewModel.measurement &&
        this.measurementTool.viewModel.measurement.directDistance &&
        this.measurementTool.viewModel.measurement.directDistance.state ===
          'available'
      ) {
        this.props.onChange(this.measurementTool.viewModel.measurement);
      }
    });
  }

  componentWillUnmount() {
    this.componentIsMounted = false;
    if (this.watcher) this.watcher.remove();
    if (this.measurementTool) this.measurementTool.destroy();
  }

  render() {
    return null;
  }
}

DistanceMeasurementTool.propTypes = {
  onChange: PropTypes.func,
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object,
};

DistanceMeasurementTool.defaultProps = {
  onChange: null,
  unit: 'metric',
  view: null,
};

export default DistanceMeasurementTool;
