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


export const getGraphicFromLine = async (startPoint, endPoint) => ({
  geometry: await getEsriGeometry({
    hasZ: false,
    paths: [
      [startPoint.mapPoint.x, startPoint.mapPoint.y],
      [endPoint.mapPoint.x, endPoint.mapPoint.y],
    ],
    spatialReference: { wkid: 3857 },
  }),
  spatialRelationship: 'esriSpatialRelIntersects',
  symbol: {
    type: 'simple-line',
    color: [255, 192, 0, 1],
    width: '3px',
  },
});


export default getGraphicFromLine;