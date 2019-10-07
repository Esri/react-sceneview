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


export const getGraphicFromRectangle = async (startPoint, endPoint, heading) => {
  const [Polygon, Polyline, geometryEngine] = await esriLoader.loadModules([
    'esri/geometry/Polygon',
    'esri/geometry/Polyline',
    'esri/geometry/geometryEngine',
  ]);

  const startX = startPoint.screenPoint.x;
  const endX = endPoint.screenPoint.x;

  const spatialRelationship = (startX > endX ? 'esriSpatialRelIntersects' : 'esriSpatialRelContains');

  const line = new Polyline({
    paths: [
      [startPoint.mapPoint.x, startPoint.mapPoint.y],
      [endPoint.mapPoint.x, endPoint.mapPoint.y],
    ],
    spatialReference: { wkid: 3857 },
  });

  const normalizedLine = geometryEngine.rotate(line, heading, startPoint.mapPoint);

  const x1 = normalizedLine.paths[0][0][0];
  const y1 = normalizedLine.paths[0][0][1];
  const x2 = normalizedLine.paths[0][1][0];
  const y2 = normalizedLine.paths[0][1][1];

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const normalizedRectangle = new Polygon({
    rings: [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
      [minX, minY],
    ],
    spatialReference: { wkid: 3857 },
  });

  const rectangle = geometryEngine.rotate(normalizedRectangle, -heading, startPoint.mapPoint);

  return {
    attributes: {
      ObjectID: 0,
    },
    geometry: rectangle,
    spatialRelationship,
    symbol: {
      type: 'simple-fill',
      color: spatialRelationship === 'esriSpatialRelContains' ? [0, 255, 255, 0.5] : [255, 192, 0, 0.5],
      outline: {
        type: 'simple-line',
        color: spatialRelationship === 'esriSpatialRelContains' ? [0, 255, 255, 1] : [255, 192, 0, 1],
        width: '3px',
      },
    },
  };
};

export default getGraphicFromRectangle;
