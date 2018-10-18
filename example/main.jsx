import React from 'react';
import { render } from 'react-dom';
import esriLoader from 'esri-loader';

import { SceneView, Scene, Layer, UI, Ground } from 'react-sceneview'; // eslint-disable-line

esriLoader.loadCss('https://js.arcgis.com/4.7/esri/css/main.css');


render(
  <SceneView id="sceneview" onClick={e => console.log(e)}>
    <UI.Zoom />
    <UI.Compass />
    <Scene basemap="gray-vector">
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
      />
    </Scene>
  </SceneView>,
  document.getElementById('root'),
);
