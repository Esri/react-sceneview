# react-sceneview

A simple Esri [SceneView](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html) react component.

## Table of Contents

- [Examples](#examples)
- [Props](#props)
- [Installing](#installing)
- [Issues](#issues)
- [Contributing](#contributing)
- [Licensing](#licensing)

## Examples

```jsx
import React from 'react';
import { render } from 'react-dom';
import { SceneView, Scene } from 'react-sceneview';

render(
  <SceneView id="sceneview">
    <Scene portalItem={{ id: '34859cee6739438d93262a5aa91bf834' }} />
  </SceneView>,
  document.getElementById('root'),
);
```

Add a [WebScene](https://developers.arcgis.com/javascript/latest/api-reference/esri-WebScene.html) and/or individual layers:

```jsx
<SceneView id="sceneview">
  <Scene>
    <Layer id="buildings" layerType="scene" url={SCENE_LAYER_URL} />
    <Layer id="districts" layerType="feature" url={FEATURE_LAYER_URL} />
  </Scene>
</SceneView>
```

Supports various features such as UI widgets, custom basemaps, selection, highlights, definitionExpression, etc...

```jsx
<SceneView id="sceneview" onClick={handleSelect}>
  <UI.Zoom position="top-left" />
  <Scene>
    <CustomBasemap portalItem={{ id: 'ae53cf192181425ab999e8a19e41a6dc' }} />
    <Layer id="1" url={URL1} layerType="scene" selectable highlight={selection} />
    <Layer id="2" url={URL2} layerType="feature" definitionExpression="Scenario IN (1,2)" />
    <Layer id="3" url={URL3} layerType="feature" visible={false} />
  </Scene>
</SceneView>
```

Dynamically add and remove layers:

```jsx
  <SceneView
    id="sceneview"
    initialCamera={initialCamera}
  >
    <Scene>
      {layers.map(({ layerId, ...layerSettings }) => (
        <Layer
          key={layerId}
          id={layerId}
          {...layerSettings}
        />
      ))}
    </Scene>
  </SceneView>
```

Supports various selection modes (_e.g._, lasso, rectangle) and has a polygon drawing tool:

```jsx
<SceneView id="sceneview">
  <Scene>
    <Layer id="buildings" layerType="scene" url={SCENE_LAYER_URL} />
    <DrawingTool onDraw={handleDrawUpdate} />
  </Scene>
</SceneView>
```

```jsx
<SceneView id="sceneview">
  <Scene>
    <Layer id="buildings" layerType="scene" url={SCENE_LAYER_URL} />
    <LassoSelectionTool onSelect={handleSelection} />
  </Scene>
</SceneView>
```

Supports client-side graphics: dynamically add and remove graphics from feature layer.

```jsx
<SceneView id="sceneview">
  <Scene>
    <Layer
      id="points"
      layerType="feature"
      geometryType="polygon"
      fields={fields}
      objectIdField="OID"
    >
      {graphics.map(graphic => (
        <Graphic geometry={graphic.geometry} attributes={graphic.attributes} symbol={graphic.symbol} />
      )}
    </Layer>
  </Scene>
  <DrawingTool onDraw={handleDrawUpdate} />
</SceneView>
```

## Props

### SceneView

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| id            | string         |         | Unique id of this sceneview. This id is used to handle hot module reloading and other component refreshes. |
| environment   | object         |         | Environment parameters of the sceneview. |
| goTo          | object |  | Sets the view to a given target `camera` or `geometry`.  |
| onClick       | function |   | Callback fired after a click in the SceneView. Returns hit test results. |
| onMouseMove   | function |   | Callback fired after a mouse move (hover) in the SceneView. Returns hit test results. |
| onCameraChange | function |  | A callback fired after the camera has been changed. Returns the new `camera` object. |

### Scene

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| basemap       | string | `gray-vector` | Specifies a basemap for the map. One of `['streets', 'satellite', 'hybrid', 'topo', 'gray', 'dark-gray', 'oceans', 'national-geographic', 'terrain', 'osm', 'dark-gray-vector', 'gray-vector', 'streets-vector', 'topo-vector', 'streets-night-vector', 'streets-relief-vector', 'streets-navigation-vector']`. |
| ground        | string | `world-elevation` | Specifies the surface properties for the map. |
| initialViewProperties | object |  | This object contains properties such as `viewpoint`, `spatialReference`, `viewingMode`, and `environment` that should be applied to the SceneView when the scene loads. |

### Layer

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| id            | string         |         | Unique id used to reference the layer. |
| url          | string         |  | URL of scene or feature layer. If omitted, a layer `source` is required. |
| visible        | bool | `true` | Indicates if the layer is visible in the SceneView. |
| selectable     | bool | `false` | Indicates if features on this layer are returned in `onClick` and `onMouseMove` events, as well as from the selection tools. |
| zoomTo         | bool | `false` | When set to `true`, the scene view will zoom to the layer extent. |
| highlight | array | `[]` | Feature object ids to be highlighted (usually selection). |
| definitionExpression | string |  | The SQL where clause used to filter features on the client. |
| renderer | object | | The renderer assigned to the layer, supplied as an [Auto-casting object](https://developers.arcgis.com/javascript/latest/guide/autocasting/index.html). |
| rendererJson | object | | The renderer assigned to the layer, supplied as a JSON object generated from a product in the ArcGIS platform. |
| labelingInfo | object | | The label definition for this layer, specified as an array of [LabelClass](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-LabelClass.html). |
| labelsVisible | bool | `false` | Indicates whether to display labels for this layer. |
| refresh | number |  | Change value to refresh the layer. |
| outFields | array | | Attribute fields which will be exposed (_e.g._, through selection callbacks). |

If using client-side graphics, the following props are required:

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| geometryType | string | | Geometry type when using client-side graphics. |
| fields | array | | Attribute fields when using client-side graphics. |
| objectIdField | string | | Object id field when using client-side graphics.|

### Graphic

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| geometry      | object         |  | The geometry that defines the graphic's location. |
| attributes    | array          |  | Name-value pairs of fields and field values associated with the graphic. |
| symbol        | object         |  | The Symbol for the graphic. |

### CustomBasemap

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| portalItem    | object         |  | The portal item (WebMap or [WebScene](https://developers.arcgis.com/javascript/latest/api-reference/esri-WebScene.html)) containing the custom base map. |

### CustomElevationLayer

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| url    | string         |  | URL pointing to the Elevation layer resource on an ArcGIS Image Server. |

### UI.Zoom, UI.Compass, UI.NavigationToggle

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| position            | string         |         | Position of the UI widget. One of `['top-left', 'top-right', 'bottom-right', 'bottom-left']`. Default is `'top-left'`. |

### DrawingTool

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| onDraw            | function         |         | Callback to handle an update of the polygon being drawn. Returns a `geometry` object with `points` and a `spatialReference`. |

### LineSelectionTool, RectangleSelectionTool, LassoSelectionTool

| Name          | Type           | Default | Description |
| :------------ | :------------- | :------ | :---------- |
| onSelect            | function         |         | Callback to handle selection. |

## Installing

Download the repository and install the dependencies:

```
$ npm install
```

Build the library:

```
$ npm build
```

Run the example:

```
$ npm example
```



## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2018 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](/license.txt) file.

