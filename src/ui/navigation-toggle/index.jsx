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


class NavigationToggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigationToggle: null,
    };

    this.loadNavigationToggle();
  }

  componentDidUpdate() {
    this.props.view.ui.move(this.state.navigationToggle, this.props.position);
  }

  componentWillUnmount() {
    this.props.view.ui.remove(this.state.navigationToggle);
  }

  async loadNavigationToggle() {
    const [EsriNavigationToggle] = await esriLoader.loadModules(['esri/widgets/NavigationToggle']);
    this.setState({ navigationToggle: new EsriNavigationToggle({ view: this.props.view }) });
    this.props.view.ui.add(this.state.navigationToggle, this.props.position);
  }

  render() {
    return null;
  }
}


NavigationToggle.propTypes = {
  position: PropTypes.string,
  view: PropTypes.object,
};


NavigationToggle.defaultProps = {
  position: 'top-left',
  view: null,
};


export default NavigationToggle;
