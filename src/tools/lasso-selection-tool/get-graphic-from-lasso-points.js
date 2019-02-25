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

import getEsriGeometry from '../../helpers/get-esri-geometry';

export const getGraphicFromLassoPoints = async (polyPoints) => {
  const points = polyPoints.map(point => point.mapPoint);
  const start = polyPoints[0].screenPoint;
  const end = polyPoints.slice(-1)[0].screenPoint;
  const distance2 =
    ((start.x - end.x) * (start.x - end.x)) + ((start.y - end.y) * (start.y - end.y));

  return (distance2 > 50 ?
  {
    attributes: {
      ObjectID: 0,
    },
    geometry: await getEsriGeometry({
      hasZ: false,
      paths: [points.map(point => [point.x, point.y])],
      spatialReference: { wkid: 3857 },
    }),
    spatialRelationship: 'esriSpatialRelIntersects',
    symbol: {
      type: 'simple-line',
      color: [255, 192, 0, 1],
      width: '3px',
    },
  } :
  {
    attributes: {
      ObjectID: 0,
    },
    geometry: await getEsriGeometry({
      hasZ: false,
      rings: [
        ...points.map(point => [point.x, point.y]),
        [points[0].x, points[0].y],
      ],
      spatialReference: { wkid: 3857 },
    }),
    spatialRelationship: 'esriSpatialRelContains',
    symbol: {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [0, 255, 255, 0.5],
      outline: {
        type: 'simple-line',
        color: [0, 255, 255, 1],
        width: '3px',
      },
    },
  });
};

export default getGraphicFromLassoPoints;
