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


const getExtent = point => ({
  type: 'extent',
  spatialReference: point.spatialReference,
  xmin: point.x,
  xmax: point.x,
  ymin: point.y,
  ymax: point.y,
  hasM: false,
  hasZ: false,
});


const queryFeaturesByGeometry = async (layerView, geometry, spatialRelationship) => {
  const [geometryEngine] = await esriLoader.loadModules(['esri/geometry/geometryEngine']);

  const extent = geometry.extent || getExtent(geometry);

  const result = await layerView.queryFeatures({
    geometry: extent,
    spatialRelationship: 'intersects',
  });

  const features = result.features || [];

  const spatialFn = spatialRelationship === 'esriSpatialRelIntersects' ?
    geometryEngine.intersects : geometryEngine.contains;

  const selectionFeatures = features
    .filter(feature => (feature.geometry ? spatialFn(geometry, feature.geometry) : true));

  return selectionFeatures;
};


const querySelectionFeatures = async (view, geometry, spatialRelationship) => {
  const layerViews = view.layerViews.items.filter(e => e.layer.selectable);
  if (layerViews.length < 1) return [];

  const queries = layerViews
    .map(layerView => queryFeaturesByGeometry(layerView, geometry, spatialRelationship));

  const results = await Promise.all(queries);
  return [].concat(...results);
};


const queryRelatedFeatures = async (view, features) => {
  const [Point] = await esriLoader.loadModules(['esri/geometry/Point']);

  const featuresWithRelation = features.filter(feature => feature.layer.relatedLayer);

  const queries = featuresWithRelation
    .map(feature => queryFeaturesByGeometry(
      view.layerViews.items.find(e => e.layer.id === feature.layer.relatedLayer),
      new Point(feature.geometry.centroid),
      'esriSpatialRelIntersects',
    ));

  const results = await Promise.all(queries);

  return [].concat(...results.map((result, index) => result.map(e => ({
    ...e.attributes,
    parentFeatureGlobalID: featuresWithRelation[index].attributes.GlobalID,
  }))));
};


export const handleSelectionQuery = async (view, selectionGeometry, spatialRelationship) => {
  const selectionFeatures =
    await querySelectionFeatures(view, selectionGeometry, spatialRelationship);

  const relatedResults = await queryRelatedFeatures(view, selectionFeatures);

  return selectionFeatures
    .map(feature => ({
      attributes: feature.attributes,
      geometry: feature.geometry,
      GlobalID: feature.attributes.GlobalID,
      objectId: feature.attributes[feature.layer.objectIdField],
      layerId: feature.layer.id,
      relatedAttributes:
        relatedResults.find(e => e.parentFeatureGlobalID === feature.attributes.GlobalID),
    }));
};


export default handleSelectionQuery;
