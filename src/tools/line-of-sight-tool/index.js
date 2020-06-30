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

class LineOfSightTool extends Component {
  async componentDidMount() {
    this.componentIsMounted = true;

    const [LineOfSight] = await esriLoader.loadModules([
      'esri/widgets/LineOfSight',
    ]);
    if (!this.componentIsMounted) return;

    this.lineOfSight = new LineOfSight({
      view: this.props.view,
    });

    this.lineOfSight.viewModel.start();
  }

  componentWillUnmount() {
    this.componentIsMounted = false;
    if (this.lineOfSight) this.lineOfSight.destroy();
  }

  render() {
    return null;
  }
}

LineOfSightTool.propTypes = {
  view: PropTypes.object,
};

LineOfSightTool.defaultProps = {
  view: null,
};

export default LineOfSightTool;
