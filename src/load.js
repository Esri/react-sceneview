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

import esriLoader from 'esri-loader';

const uiPositions = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

export const loadEsriSceneView = async (componentRef, id, sceneviewSettings) => {
  if (!window.sceneViews) {
    window.sceneViews = {};
  }

  if (window.sceneViews[id]) {
    componentRef.appendChild(window.sceneViews[id].container);
    return window.sceneViews[id].view;
  }

  const container = document.createElement('DIV');
  container.style = 'width: 100%; height: 100%;';
  componentRef.appendChild(container);

  const [SceneView] = await esriLoader.loadModules(['esri/views/SceneView']);

  const view = new SceneView({ container, ...sceneviewSettings });
  window.sceneViews[id] = { container, view };

  uiPositions.forEach(position => view.ui.empty(position));

  return view;
};

export default loadEsriSceneView;
