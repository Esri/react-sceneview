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
// import unitOptions from '../../helpers/unit-options';


class DrawingTool extends Component {
  async componentDidMount() {
    const { view } = this.props;

    const [SketchViewModel, GraphicsLayer] = await esriLoader.loadModules([
      'esri/widgets/Sketch/SketchViewModel',
      'esri/layers/GraphicsLayer',
    ]);

    this.layer = new GraphicsLayer();
    view.map.add(this.layer);

    this.model = new SketchViewModel({
      layer: this.layer,
      view,
    });

    this.model.create('polygon', { mode: 'click' });

    this.model.on('create', (event) => {
      if (event.state === 'complete') {
        this.props.onDraw({
          geometry: event.graphic.geometry,
          area: 1,
        });
        this.model.update(event.graphic, { tool: 'reshape' });
      }
    });

    this.model.on('update', (event) => {
      this.props.onDraw({
        geometry: event.graphics[0].geometry,
        area: 1,
      });
    });
  }

  componentWillUnmount() {
    this.model.cancel();
    this.props.view.map.remove(this.layer);
  }

  render() {
    return null;
  }
}


DrawingTool.propTypes = {
  onDraw: PropTypes.func,
  // unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object.isRequired,
};


DrawingTool.defaultProps = {
  unit: 'metric',
  onDraw: () => null,
};


export default DrawingTool;
