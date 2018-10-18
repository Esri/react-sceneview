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

import esriLoader from 'esri-loader';

import { loadEsriSceneView } from '../load';

const componentRef = {
  appendChild: jest.fn(),
};

jest.mock('esri-loader', () => {
  const SceneView = jest.fn();
  SceneView.prototype.ui = { empty: jest.fn() };

  return {
    SceneView,
    loadModules: jest.fn(() => Promise.resolve([SceneView])),
  };
});


describe('components', () => {
  describe('loadEsriSceneView', () => {
    const id = 'sceneview';
    const sceneviewSettings = {
      basemap: 'gray-vector',
    };

    it('should initialize an Esri SceneView, attach it to the component.', async () => {
      await loadEsriSceneView(componentRef, id, sceneviewSettings);
      expect(componentRef.appendChild).toHaveBeenCalled();
      const container = componentRef.appendChild.mock.calls[0][0];
      expect(esriLoader.loadModules).toHaveBeenCalledWith(['esri/views/SceneView']);
      expect(esriLoader.SceneView).toHaveBeenCalledWith({ container, ...sceneviewSettings });
      expect(esriLoader.SceneView.prototype.ui.empty).toHaveBeenCalledWith('top-left');
      expect(esriLoader.SceneView.prototype.ui.empty).toHaveBeenCalledWith('top-right');
      expect(esriLoader.SceneView.prototype.ui.empty).toHaveBeenCalledWith('bottom-left');
      expect(esriLoader.SceneView.prototype.ui.empty).toHaveBeenCalledWith('bottom-right');
    });
  });
});
