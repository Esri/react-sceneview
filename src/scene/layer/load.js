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

const layerTypes = {
  feature: 'esri/layers/FeatureLayer',
  scene: 'esri/layers/SceneLayer',
  graphics: 'esri/layers/GraphicsLayer',
  tile: 'esri/layers/TileLayer',
  'vector-tile': 'esri/layers/VectorTileLayer',
  'web-tile': 'esri/layers/WebTileLayer',
  'integrated-mesh': 'esri/layers/IntegratedMeshLayer',
  'point-cloud': 'esri/layers/PointCloudLayer',
  'building-scene': 'esri/layers/BuildingSceneLayer',
};

export const loadLayer = async ({
  id,
  layerType,
  url,
  portalItem,
  source,
  selection,
  fields,
  objectIdField,
  geometryType,
  rendererJson,
  ...layerOptions
}) => {
  const layerSettings = {
    id,
    minScale: 0,
    maxScale: 0,
    ...layerOptions,
  };

  if (rendererJson) {
    const [rendererJsonUtils] = await esriLoader.loadModules([
      'esri/renderers/support/jsonUtils',
    ]);
    layerSettings.renderer = rendererJsonUtils.fromJSON(rendererJson);
  }

  if (url) {
    const [EsriLayer] = await esriLoader.loadModules(['esri/layers/Layer']);
    const layer = await EsriLayer.fromArcGISServerUrl({ url });
    Object.keys(layerSettings).forEach(
      key => layer[key] = layerSettings[key],
    );
    return layer;
  }

  if (portalItem) {
    const [EsriLayer] = await esriLoader.loadModules(['esri/layers/Layer']);
    const layer = await EsriLayer.fromPortalItem({ portalItem });
    Object.keys(layerSettings).forEach(
      key => (layer[key] = layerSettings[key]),
    );
    return layer;
  }

  layerSettings.source = source || [];
  layerSettings.fields = fields;
  layerSettings.objectIdField = objectIdField;
  layerSettings.geometryType = geometryType;

  const [Layer] = await esriLoader.loadModules([layerTypes[layerType]]);
  return new Layer(layerSettings);
};

export default loadLayer;
