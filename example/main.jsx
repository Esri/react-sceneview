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

/* eslint-disable no-unused-vars */

import React from 'react';
import { render } from 'react-dom';

import {
  SceneView,
  Scene,
  Layer,
  UI,
  Ground,
  SliceTool,
  DistanceMeasurementTool,
  DrawingTool,
} from '../src';

const initialViewProperties = {
  viewpoint: {
    camera: {
      position: {
        latitude: 45.49329824845787,
        longitude: -73.56433825651148,
        z: 1491.931965556927,
      },
      tilt: 60,
      heading: 355,
    },
  },
};

render(
  <SceneView
    id="sceneview"
    // onLoad={e => console.log(e)}
  >
    <UI.Zoom />
    <UI.Compass />
    <Scene
      basemap="streets"
      initialViewProperties={initialViewProperties}
      // onLoad={e => console.log(e)}
    >
      <Ground
        opacity={0.5}
        navigationConstraint={{ type: 'none' }}
      />
      <Layer
        id="buildings"
        layerType="scene"
        selectable
        url="https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Building_Montreal/SceneServer"
        // onLoad={e => console.log(e)}
      />
    </Scene>
  </SceneView>,
  document.getElementById('root'),
);
