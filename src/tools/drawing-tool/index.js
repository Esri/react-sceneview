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


class DrawingTool extends Component {
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
        this.props.onDraw({
          geometry: {
            points:
              this.measurementTool.viewModel.tool.model.path.vertices.items
                .map(({ latitude, longitude, x, y, z }) => ({
                  latitude,
                  longitude,
                  x,
                  y,
                  z,
                })),
            spatialReference:
              this.measurementTool.viewModel.tool.model.path.vertices.items[0].spatialReference,
          },
          area: this.measurementTool.viewModel.tool.area.value,
        });
      } else {
        this.props.onDraw({
          geometry: null,
          area: 0,
        });
      }
    });
  }

  componentWillUnmount() {
    this.watcher.remove();
    this.measurementTool.destroy();
  }

  render() {
    return null;
  }
}


DrawingTool.propTypes = {
  onDraw: PropTypes.func,
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object.isRequired,
};


DrawingTool.defaultProps = {
  unit: 'metric',
  onDraw: () => null,
};


export default DrawingTool;
