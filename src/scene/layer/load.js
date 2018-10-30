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


const layerTypes = {
  feature: 'esri/layers/FeatureLayer',
  scene: 'esri/layers/SceneLayer',
  graphics: 'esri/layers/GraphicsLayer',
  tile: 'esri/layers/TileLayer',
  'vector-tile': 'esri/layers/VectorTileLayer',
};


export const addLayerToView = async (view, { id, layerType, url, portalItem, source, selection,
  fields, objectIdField, geometryType, rendererJson, ...layerOptions }) => {
  // if layer already exists, might need to update the layerSettings
  if (!view) {
    console.error(`problem with layer ${id}.`);
    return null;
  }

  const existingLayer = view.map.layers.items.find(l => l.id === id);
  if (existingLayer) {
    Object.keys(layerOptions).forEach(key => existingLayer[key] = layerOptions[key]);
    return existingLayer;
  }

  const layerSettings = {
    id,
    popupEnabled: false,
    minScale: 0,
    maxScale: 0,
    ...layerOptions,
  };

  if (url) {
    layerSettings.url = url;
  } else if (portalItem) {
    layerSettings.portalItem = portalItem;
  } else {
    layerSettings.source = source || [];
    layerSettings.fields = fields;
    layerSettings.objectIdField = objectIdField;
    layerSettings.geometryType = geometryType;
  }

  if (rendererJson) {
    const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);
    layerSettings.renderer = rendererJsonUtils.fromJSON(rendererJson);
  }

  const [Layer] = await esriLoader.loadModules([layerTypes[layerType]]);
  const layer = new Layer(layerSettings);

  view.map.add(layer);

  return layer;
};


export const loadLayer = async (view, settings) => {
  const layer = await addLayerToView(view, settings);
  const layerView = await view.whenLayerView(layer);

  return { layer, layerView };
};


export default addLayerToView;
