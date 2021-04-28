/* Copyright 2021 Esri
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

class ElevationProfileTool extends Component {
  async componentDidMount() {
    this.componentIsMounted = true;

    const [ElevationProfile] = await esriLoader.loadModules([
      'esri/widgets/ElevationProfile',
    ]);
    if (!this.componentIsMounted) return;

    this.elevationProfileTool = new ElevationProfile({
      view: this.props.view,
      unit: this.props.unit,
      profiles: [
        {
          type: 'ground',
          color: '#61d4a4',
          title: 'Ground Elevation',
        },
        {
          type: 'view',
          color: '#8f61d4',
          title: 'View Elevation',
        },
      ],
    });

    if (this.props.onDidMount) this.props.onDidMount();
  }

  componentWillUnmount() {
    this.componentIsMounted = false;
    if (this.elevationProfileTool) this.elevationProfileTool.destroy();
  }

  render() {
    return null;
  }
}

ElevationProfileTool.propTypes = {
  unit: PropTypes.oneOf(unitOptions),
  view: PropTypes.object,
  onDidMount: PropTypes.func,
};

ElevationProfileTool.defaultProps = {
  unit: 'metric',
  view: null,
  onDidMount: null,
};

export default ElevationProfileTool;
