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


class SliceTool extends Component {
  async componentDidMount() {
    const [Slice] = await esriLoader.loadModules([
      'esri/widgets/Slice',
    ]);

    this.sliceTool = new Slice({
      view: this.props.view,
    });

    this.sliceTool.viewModel.newSlice();

    this.sliceTool.viewModel.excludeGroundSurface = this.props.excludeGround;
  }

  componentWillUnmount() {
    this.sliceTool.destroy();
  }

  render() {
    return null;
  }
}

SliceTool.propTypes = {
  excludeGround: PropTypes.bool,
  view: PropTypes.object.isRequired,
};

SliceTool.defaultProps = {
  excludeGround: false,
};

export default SliceTool;
