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
import esriLoader from 'esri-loader';

import Scene from '../index';
import Layer from '../layer';
import CustomBasemap from '../custom-basemap';
import CustomElevationLayer from '../custom-elevation-layer';
import SelectionLayer from '../selection-layer';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('esri-loader', () => {
  const WebScene = jest.fn();
  WebScene.prototype.load = jest.fn();
  WebScene.prototype.add = jest.fn();

  return {
    WebScene,
    loadModules: jest.fn(() => Promise.resolve([WebScene])),
  };
});

jest.mock('../layer', () => (view) => {
  if (!view) return null;
  return <div id="layer" />;
});

jest.mock('../custom-basemap', () => (view) => {
  if (!view) return null;
  return <div id="basemap" />;
});

jest.mock('../custom-elevation-layer', () => (view) => {
  if (!view) return null;
  return <div id="elevation-layer" />;
});

jest.mock('../selection-layer', () => (id, view) => {
  if (!id || !view) return null;
  return <div id="selection-layer" />;
});

const viewPromise = Promise.resolve();
const viewMock = {
  when: jest.fn(() => viewPromise),
};


describe('components', () => {
  describe('<Scene />', async () => {
    it('should render self, load webscene, and attach it to view', async () => {
      const props = {
        view: viewMock,
        mode: 'nav',
        basemap: 'gray-vector',
        ground: 'world-elevation',
        portalItem: { id: '1234' },
        initialViewProperties: {
          environment: {
            lighting: {
              date: new Date(Date.UTC(2018, 4, 1, 16)),
              directShadowsEnabled: true,
              ambientOcclusionEnabled: false,
            },
          },
        },
      };

      const wrapper = mount(<Scene {...props} />);

      expect(esriLoader.loadModules).toHaveBeenCalledWith(['esri/WebScene']);

      const [WebScene] = await esriLoader.loadModules(['esri/WebScene']);

      const { view, mode, ...websceneSettings } = props;
      expect(WebScene).toHaveBeenCalledWith(websceneSettings);
      expect(WebScene.prototype.load).toHaveBeenCalled();

      await WebScene.prototype.load();
      expect(viewMock.when).toHaveBeenCalled();

      // await viewMock.when();
      // expect(wrapper.find('div').exists()).toBe(true);
    });

    // it('should render Children', (done) => {
    //   const props = {
    //     view: viewMock,
    //     mode: 'nav',
    //   };
    //
    //   const wrapper = mount(<Scene {...props}>
    //     <Layer />
    //     <CustomBasemap />
    //     <CustomElevationLayer />
    //   </Scene>);
    //
    //   setTimeout(() => {
    //     try {
    //       expect(wrapper.find('#scene').children().find(Layer).exists()).toBe(true);
    //       expect(wrapper.find('#scene').children().find(CustomBasemap).exists()).toBe(true);
    //       expect(wrapper.find('#scene').children().find(CustomElevationLayer).exists()).toBe(true);
    //       expect(wrapper.find('#scene').children().find(SelectionLayer).exists()).toBe(true);
    //       done();
    //     } catch (e) {
    //       done.fail(e);
    //     }
    //   }, 100);
    // });
  });
});
