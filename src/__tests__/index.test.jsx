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

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import SceneView from '../index';

import { loadEsriSceneView } from '../load';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../scene', () => (view, mode) => {
  if (!view || !mode) return null;
  return <div id="scene" />;
});

jest.mock('../event-listeners', () => ({
  Selection: (view, mode, onSelect) => {
    if (!view || !mode || !onSelect) return null;
    return <div id="selectionEventListenerMock" />;
  },
  Camera: (view, onCameraChange) => {
    if (!view || !onCameraChange) return null;
    return <div id="cameraEventListenerMock" />;
  },
}));

jest.mock('../load', () => ({
  loadEsriSceneView: jest.fn(() => Promise.resolve({
    on: jest.fn(),
    watch: jest.fn(),
  })),
}));

describe('components', () => {
  describe('<SceneView />', () => {
    it('should render self and call loadSceneView(...)', () => {
      const props = {
        id: 'a1b2c3',
        mode: 'nav',
        goTo: { tilt: 50 },
      };

      const wrapper = mount(<SceneView {...props} />);

      expect(wrapper.find('#sceneview').exists()).toBe(true);
      expect(loadEsriSceneView).toHaveBeenCalled();
    });
  });
});
