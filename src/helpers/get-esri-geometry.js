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


export const getEsriGeometry = async (geometry) => {
  const [Polygon, Polyline, Point, Mesh] =
    await esriLoader.loadModules([
      'esri/geometry/Polygon',
      'esri/geometry/Polyline',
      'esri/geometry/Point',
      'esri/geometry/Mesh',
    ]);

  if (geometry.rings) return new Polygon(geometry);
  if (geometry.paths) return new Polyline(geometry);
  if (geometry.components) return new Mesh(geometry);
  if (geometry.points) return 'multipoint';
  if (geometry.x) return new Point(geometry);
  if (geometry.xmin) return 'extent';

  return null;
};


export default getEsriGeometry;
