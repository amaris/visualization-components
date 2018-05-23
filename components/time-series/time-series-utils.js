"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
function fk(v) {
    return function (d) {
        return d[v];
    };
}
exports.fk = fk;
function functorkeyscale(v, scale) {
    var f = typeof v === "function" ? v : function (d) {
        return d[v];
    };
    return function (d) {
        return scale(f(d));
    };
}
exports.functorkeyscale = functorkeyscale;
function keyNotNull(k) {
    return function (d) {
        return d.hasOwnProperty(k) && d[k] !== null && !isNaN(d[k]);
    };
}
exports.keyNotNull = keyNotNull;
//# sourceMappingURL=time-series-utils.js.map