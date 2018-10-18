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


const groundSettingsProps = {
  navigationConstraint: PropTypes.object,
  opacity: PropTypes.number,
  surfaceColor: PropTypes.node,
};


const getSettings = (props) => {
  const settings = {};

  Object.keys(groundSettingsProps)
    .filter(key => props[key] !== null && props[key] !== undefined)
    .forEach(key => settings[key] = props[key]);

  return settings;
};


const getUpdates = (props, nextProps) => {
  const updates = {};

  Object.keys(groundSettingsProps)
    .filter(key => props[key] !== nextProps[key])
    .forEach(key => updates[key] = nextProps[key]);

  return updates;
};


class Ground extends Component {
  constructor(props) {
    super(props);

    const settings = getSettings(this.props);
    Object.keys(settings).forEach(key => this.props.view.map.ground[key] = settings[key]);
  }

  async componentDidUpdate(prevProps) {
    const updates = getUpdates(prevProps, this.props);

    Object.keys(updates).forEach(key => this.props.view.map.ground[key] = updates[key]);
  }

  render() {
    return null;
  }
}


Ground.propTypes = {
  ...groundSettingsProps,
  view: PropTypes.object.isRequired,
};


Ground.defaultProps = {
  navigationConstraint: null,
  opacity: null,
  surfaceColor: null,
};


export default Ground;
