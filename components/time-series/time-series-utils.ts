/* 
 * Visualisation Components - https://github.com/amaris/visualization-components
 * Copyright (C) 2018 Amaris <rpawlak@amaris.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

export function fk(v: any) {
  return function (d: any) {
    return d[v];
  };
}

export function functorkeyscale(v: any, scale: any) {
  var f = typeof v === "function" ? v : function (d: any) {
    return d[v];
  };
  return function (d: any) {
    return scale(f(d));
  };
}

export function keyNotNull(k: string) {
  return function (d: any) {
    return d.hasOwnProperty(k) && d[k] !== null && !isNaN(d[k]);
  };
}
