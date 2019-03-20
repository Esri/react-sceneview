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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Compass from './compass';
import NavigationToggle from './navigation-toggle';
import Zoom from './zoom';

class UI extends Component {
  componentDidMount() {
    this.updatePadding();
  }

  componentDidUpdate(prevProps) {
    if (this.props.padding !== prevProps.padding) this.updatePadding();
  }

  updatePadding() {
    console.log(this.props.padding);
    this.props.view.ui.padding = this.props.padding;
  }


  renderWrappedChildren(children) {
    return React.Children.map(children, (child) => {
      // This is support for non-node elements (eg. pure text), they have no props
      if (!child || !child.props) {
        return child;
      }

      if (child.props.children) {
        return React.cloneElement(child, {
          children: this.renderWrappedChildren(child.props.children),
          view: this.props.view,
        });
      }

      return React.cloneElement(child, {
        view: this.props.view,
      });
    });
  }


  render() {
    return this.props.view && (
      <React.Fragment>
        {this.renderWrappedChildren(this.props.children)}
      </React.Fragment>
    );
  }
}


UI.propTypes = {
  padding: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  children: PropTypes.node,
  view: PropTypes.object.isRequired,
};


UI.defaultProps = {
  padding: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  },
  children: [],
};


UI.Compass = Compass;
UI.NavigationToggle = NavigationToggle;
UI.Zoom = Zoom;

export { Compass, NavigationToggle, Zoom };

export default UI;
