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
      profiles: this.props.profiles,
    });

    if (this.props.onLoad) this.props.onLoad();
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
  onLoad: PropTypes.func,
  profiles: PropTypes.array,
};

ElevationProfileTool.defaultProps = {
  unit: 'metric',
  view: null,
  onLoad: null,
  profiles: [
    {
      type: 'ground',
      color: '#61d4a4',
      title: 'Ground Elevation',
    },
  ],
};

export default ElevationProfileTool;
