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

import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { loadLayer } from '../load';

import Layer from '../index';

Enzyme.configure({ adapter: new Adapter() });

const viewPromise = Promise.resolve();
const viewMock = {
  whenLayerView: jest.fn(() => viewPromise),
  map: {
    layers: {
      remove: jest.fn(),
    },
  },
};

jest.mock('../load', () => ({
  loadLayer: jest.fn((view, layerSettings) => Promise.resolve({
    layer: { ...layerSettings },
    layerView: {},
  })),
}));


describe('components', () => {
  describe('<Layer />', async () => {
    const layerSettings = {
      id: 'layer-1',
      layerType: 'feature',
      url: 'http://test',
      visible: true,
      labelsVisible: false,
      selectable: false,
      outFields: ['*'],
    };

    const props = {
      view: viewMock,
      ...layerSettings,
    };

    const wrapper = mount(<Layer {...props} />);

    it('mount: should call addLayerToView(...), view.whenLayerView(...), add both to component state', async () => {
      expect(loadLayer).toHaveBeenCalledWith(viewMock, { ...layerSettings });
      await Promise.resolve();
    });

    it('should update layer visiblity when changing visibility prop', async () => {
      wrapper.setProps({ visible: false });
      expect(wrapper.state('layer')).toEqual({
        ...layerSettings,
        visible: false,
      });
    });

    // it('unmount: should remove layer', async () => {
    //   wrapper.unmount();
    //   expect(viewMock.map.layers.remove)
    //     .toHaveBeenCalledWith(expect.objectContaining({ id: layerSettings.id }));
    // });
  });
});
