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
import layerSettingsProps from './layer-settings-props';

const getLayerUpdates = (prevProps, nextProps) => {
  const changes = Object
    .keys(layerSettingsProps)
    .filter(key => prevProps.layerType !== 'web-tile' || (key !== 'legendEnabled' && key !== 'popupEnabled'))
    .filter(key => !(prevProps[key] === undefined && nextProps[key] === null))
    .filter(key => prevProps[key] !== nextProps[key]);

  if (changes.length === 0) return {};

  const updates = {};
  changes.forEach(key => updates[key] = nextProps[key]);

  return updates;
};

export const applyUpdates = (prevProps, nextProps, layer, layerView, esriUtils) => {
  const updatesDiff = getLayerUpdates(prevProps, nextProps);

  const {
    rendererJson,
    source,
    maskingGeometry,
    ...updates
  } = updatesDiff;

  Object.keys(updates).forEach(key => layer[key] = updates[key]);

  if (rendererJson !== undefined) {
    layer.renderer = esriUtils.rendererJsonUtils.fromJSON(rendererJson);
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

  if (maskingGeometry !== undefined) {
    if (!nextProps.maskingGeometry) {
      if (layerView) layerView.filter = null;
      layer.modifications = null;
      return;
    }

    const polygon = new esriUtils.Polygon(nextProps.maskingGeometry);

    if (layer.type === 'scene' && layerView) {
      layerView.filter = new esriUtils.FeatureFilter({
        geometry: polygon,
        spatialRelationship: 'disjoint',
      });
    }

    if (layer.type === 'integrated-mesh') {
      layer.modifications = new esriUtils.SceneModifications(
        [
          new esriUtils.SceneModification({ geometry: polygon, type: 'clip' }),
        ],
      );
    }
  }
};

export default applyUpdates;
