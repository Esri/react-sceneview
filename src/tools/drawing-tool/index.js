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

const isValidGeometry = geometry => geometry && ['point', 'multipoint', 'polyline', 'polygon'].includes(geometry.type);

class DrawingTool extends Component {
  async componentDidMount() {
    const { view, geometry } = this.props;

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

    if (isValidGeometry(geometry)) {
      this.setGraphic(geometry);
    } else {
      this.createGraphic();
    }

    this.onCreate = this.model.on('create', (event) => {
      if (event.state === 'complete') {
        this.props.onDraw({
          geometry: event.graphic.geometry,
          area: 1,
        });
        this.model.update(event.graphic, { tool: 'reshape' });
      } else if (event.state === 'cancel') {
        this.onCancel();
      }
    });

    this.onUpdate = this.model.on('update', (event) => {
      if (event.state === 'active' || event.state === 'complete') {
        this.props.onDraw({
          geometry: event.graphics[0].geometry,
          area: 1,
        });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.model) return;

    const { geometry } = this.props;

    if (prevProps.geometry !== null && geometry === null) {
      this.resetGraphic();
      this.createGraphic();
    } else if (isValidGeometry(geometry) && geometry.reset) {
      this.resetGraphic();
      this.setGraphic(geometry);
    }
  }

  componentWillUnmount() {
    this.willUnmount = true;

    if (this.model && this.model.state === 'active') this.model.cancel();
    if (this.layer) this.props.view.map.remove(this.layer);
    if (this.onCreate) this.onCreate.remove();
    if (this.onUpdate) this.onUpdate.remove();

    // manually remove remaining tool handles
    this.props.view.tools.items
      .filter(tool => tool.type === 'reshape-3d')
      .map(tool => tool.reset());
  }

  onCancel() {
    if (this.willUnmount) return;

    const { geometry } = this.props;

    if (geometry && geometry.reset) return;

    this.createGraphic();
  }

  getSymbol(type) {
    switch (type) {
      case 'point':
      case 'multipoint':
        return this.model.pointSymbol;
      case 'polygon':
        return this.model.polygonSymbol;
      case 'polyline':
        return this.model.polylineSymbol;
      default:
        return this.model.polygonSymbol;
    }
  }

  setGraphic(geometry) {
    this.layer.graphics.add({
      geometry,
      symbol: this.getSymbol(geometry.type),
    });
    this.model.update(this.layer.graphics.items[0], { tool: 'reshape' });
  }

  resetGraphic() {
    this.model.cancel();
    this.layer.graphics.removeAll();
  }

  createGraphic() {
    this.model.create(this.props.geometryType, { mode: this.props.mode });
  }

  render() {
    return null;
  }
}


DrawingTool.propTypes = {
  onDraw: PropTypes.func,
  geometryType: PropTypes.oneOf(['point', 'multipoint', 'polyline', 'polygon', 'rectangle', 'circle']),
  mode: PropTypes.oneOf(['hybrid', 'freehand', 'click']),
  view: PropTypes.object.isRequired,
  geometry: PropTypes.object,
};


DrawingTool.defaultProps = {
  geometryType: 'polygon',
  mode: 'click',
  unit: 'metric',
  geometry: null,
  onDraw: () => null,
};


export default DrawingTool;
