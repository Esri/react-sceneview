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

import { layerSettingsProps } from './index';


const getLayerUpdates = (props, nextProps) => {
  const changes = Object.keys(layerSettingsProps)
    .filter(key => props[key] !== nextProps[key]);

  if (changes.length === 0) return null;

  const updates = {};
  changes.forEach(key => updates[key] = nextProps[key]);

  return updates;
};


// TODO: do we use this?
const applyRenderer = async (rendererJson) => {
  const [rendererJsonUtils] = await esriLoader.loadModules(['esri/renderers/support/jsonUtils']);

  this.state.layer.renderer = rendererJsonUtils.fromJSON(rendererJson);
};


export const applyUpdates = async (prevProps, nextProps, layer, layerView) => {
  const updatesDiff = getLayerUpdates(prevProps, nextProps);
  console.log(updatesDiff);

  const {
    rendererJson,
    labelingInfoJson, // ???
    source,
    maskingGeometry,
    ...updates
  } = updatesDiff;

  Object.keys(updates).forEach(key => this.state.layer[key] = updates[key]);

  if (rendererJson) {
    await applyRenderer(rendererJson);
  }

  // update source graphics
  if (source) {
    const newFeatures = nextProps.source
      .filter(feature => !prevProps.source.includes(feature));

    const oldFeatures = prevProps.source
      .filter(feature => !nextProps.source.includes(feature));

    if (!newFeatures.length && !oldFeatures.length) return;

    layer.applyEdits({
      addFeatures: newFeatures,
      deleteFeatures: oldFeatures,
    });
  }

  // fix refresh bug
  if (nextProps.visible && nextProps.visible !== prevProps.visible) {
    if (layerView && layerView.refresh) layerView.refresh();
  }

  if (maskingGeometry) {
    if (!layerView) return;

    const [FeatureFilter, Polygon] = await esriLoader.loadModules([
      'esri/views/layers/support/FeatureFilter',
      'esri/geometry/Polygon',
    ]);

    layerView.filter = nextProps.maskingGeometry ? new FeatureFilter({
      geometry: new Polygon(nextProps.maskingGeometry),
      spatialRelationship: 'disjoint',
    }) : null;
  }
};


export default applyUpdates;
