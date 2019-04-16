/* Copyright 2017 Esri
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
import { render } from 'react-dom';

import { SceneView, Scene, Layer, UI, Ground, SliceTool, DistanceMeasurementTool, DrawingTool } from 'react-sceneview'; // eslint-disable-line

const initialGeometry = {
  type: 'polygon',
  rings: [
    [-8188825.165368124, 5702959.769073752],
    [-8188716.615804167, 5703128.839067342],
    [-8188563.815668999, 5703041.904958983],
    [-8188626.09936864, 5702945.593375879],
    [-8188825.165368124, 5702959.769073752],
  ],
  spatialReference: {
    wkid: 102100,
    latestWkid: 3857,
  },
};

render(
  <SceneView
    id="sceneview"
    onLoad={e => console.log(e)}
  >
    <UI.Zoom />
    <UI.Compass />
    <Scene
      basemap="streets"
      onLoad={e => console.log(e)}
    >
      <Ground
        opacity={0.5}
        navigationConstraint={{ type: 'none' }}
      />
      <Scene.Layer
        id="buildings"
        layerType="scene"
        zoomTo
        selectable
        url="https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Building_Montreal/SceneServer"
        onLoad={e => console.log(e)}
      />
    </Scene>
    <DrawingTool
      onDraw={e => console.log(e)}
      initialGeometry={initialGeometry}
    />
  </SceneView>,
  document.getElementById('root'),
);
