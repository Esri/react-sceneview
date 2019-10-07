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

import esriLoader from 'esri-loader';
import { loadLayer } from '../load';

import Layer from '../index';

Enzyme.configure({ adapter: new Adapter() });

const viewPromise = Promise.resolve();
const viewMock = {
  whenLayerView: jest.fn(() => viewPromise),
  map: {
    add: jest.fn(),
    layers: {
      remove: jest.fn(),
      items: [],
    },
  },
};

jest.mock('esri-loader', () => {
  const WebScene = jest.fn();
  WebScene.prototype.load = jest.fn();
  WebScene.prototype.add = jest.fn();

  return {
    WebScene,
    loadModules: jest.fn(() => Promise.resolve([WebScene])),
  };
});

const mockWhen = jest.fn(() => Promise.resolve());

jest.mock('../load', () => ({
  loadLayer: jest.fn(layerSettings => Promise.resolve({
    ...layerSettings,
    when: mockWhen,
  })),
}));


describe('components', () => {
  describe('<Layer />', () => {
    const layer = {
      id: 'layer-1',
      layerType: 'feature',
      url: 'http://test',
      visible: true,
      labelsVisible: false,
      selectable: false,
      outFields: ['*'],
      hasZ: false,
      legendEnabled: true,
      onLoad: () => null,
      popupEnabled: false,
    };

    const wrapper = mount(<Layer view={viewMock} {...layer} />);

    it('mount: should call loadLayer with correct layer settings', async () => {
      expect(loadLayer).toHaveBeenCalledWith(layer);
      await Promise.resolve();
      expect(viewMock.map.add).toHaveBeenCalled();
      await Promise.resolve();
      expect(viewMock.whenLayerView).toHaveBeenCalled();
    });

    it('should update layer visiblity when changing visibility prop', async () => {
      wrapper.setProps({ visible: false });
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(wrapper.state('layer')).toEqual({
        ...layer,
        when: mockWhen,
        visible: false,
      });
    });
  });
});
