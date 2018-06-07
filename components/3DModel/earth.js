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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = require("d3");
require("jquery");
const topojson = require("topojson-client");
__export(require("./DHelpers"));
const index_1 = require("../index");
const L = require("leaflet");
class Earth {
    build(config) {
        this.config = config;
        if (typeof this.config.container == "string") {
            this.container = document.getElementById(this.config.container);
        }
        else {
            this.container = this.config.container;
        }
        if (!this.config.bakcgroundColor) {
            this.config.bakcgroundColor = "#000";
        }
        if (!this.config.foregroundColor) {
            this.config.foregroundColor = "#f3de84";
        }
        if (typeof this.config.data == "string") {
            d3.json(this.config.data, (error, rootData) => {
                this.buildFromData(rootData);
            });
        }
        else {
            this.data = this.config.data;
            this.createEarth();
        }
    }
    createEarth() {
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.container.clientWidth)
            .attr('height', this.container.clientHeight)
            .attr('viewBox', '0, 0, ' + this.container.clientWidth + ', ' + this.container.clientHeight);
        this.simpleMap = $(this.container).append('<div class="simple-map"></div>').get(0);
        var map = L.map(this.simpleMap, {
            center: [51.505, -0.09],
            zoom: 13
        });
        this.projection = d3.geoOrthographic()
            .scale(300)
            .translate([this.container.clientWidth / 2, this.container.clientHeight / 2])
            .clipAngle(90)
            .precision(10);
        this.path = d3.geoPath()
            .projection(this.projection);
        let graticule = d3.geoGraticule();
        this.svg.append("def")
            .datum({ type: "Sphere" })
            .attr("class", "sphere")
            .attr("d", this.path);
        this.svg.append("defs").append("path")
            .datum({ type: "Sphere" })
            .attr("id", "sphere")
            .attr("fill", "#2a468c")
            .attr("d", this.path);
        this.svg.append("use")
            .attr("class", "stroke")
            .attr("fill", "none")
            .attr("stroke", "none")
            .attr("stroke-width", "1px")
            .attr("xlink:href", "#sphere");
        this.svg.append("use")
            .attr("class", "fill")
            .attr("fill", this.config.bakcgroundColor)
            .attr("xlink:href", "#sphere");
        this.svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("fill", "none")
            .attr("stroke", this.config.foregroundColor)
            .attr("stroke-width", ".2px")
            .attr("stroke-opacity", ".2")
            .attr("d", this.path);
        this.markerGroup = this.svg.append('g')
            .attr("class", "marker-group");
        var drag = d3.drag()
            .on("start", () => this.gpos0 = this.projection.invert(d3.mouse(this.container)))
            .on("drag", () => {
            var gpos1 = this.projection.invert(d3.mouse(this.container));
            var rotation = this.projection.rotate();
            var eulerRotation = index_1.DHelpers.eulerAngles(this.gpos0, gpos1, rotation);
            this.projection.rotate(eulerRotation);
            this.svg.selectAll("path").attr("d", this.path);
            this.markerGroup.selectAll('circle')
                .data(this.data)
                .attr('cx', (d) => this.projection([d.long, d.lat])[0])
                .attr('cy', (d) => this.projection([d.long, d.lat])[1])
                .attr('fill', (d) => {
                var gdistance = d3.geoDistance([d.long, d.lat], this.projection.invert([this.container.clientWidth / 2, this.container.clientHeight / 2]));
                return gdistance > 1.2 ? 'none' : 'steelblue';
            })
                .attr('r', 7);
            this.svg.selectAll(".marker-group")
                .selectAll("text")
                .data(this.data)
                .attr("x", (d) => this.projection([d.long, d.lat])[0])
                .attr("y", (d) => this.projection([d.long, d.lat])[1] - 5)
                .attr("fill", (d) => {
                var gdistance = d3.geoDistance([d.long, d.lat], this.projection.invert([this.container.clientWidth / 2, this.container.clientHeight / 2]));
                return gdistance > 1.57 ? 'none' : '#000';
            })
                .attr("font-size", "14px")
                .attr("font-family", "sans-serif")
                .attr("text-anchor", "middle")
                .text((d) => d.value);
        });
        var zoom = d3.zoom().scaleExtent([0.1, 7.0])
            .on("zoom", () => {
            this.svg.selectAll("path").attr("transform", d3.event.transform);
            this.svg.selectAll("circle").attr("transform", d3.event.transform);
            this.svg.selectAll("text").attr("transform", d3.event.transform);
        });
        this.svg.call(zoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);
        this.svg.call(drag);
        d3.json("/components/3Dmodel/world-110m.v1.json", (error, world) => {
            d3.tsv("/components/3Dmodel/world-country-names.tsv", (error, names) => {
                this.stratLoaded(error, world, this.svg, names);
                this.svg.selectAll(".marker-group")
                    .selectAll("circle")
                    .data(this.data)
                    .enter()
                    .append("circle")
                    .attr('cx', (d) => this.projection([d.long, d.lat])[0])
                    .attr('cy', (d) => this.projection([d.long, d.lat])[1])
                    .attr('fill', (d) => {
                    var gdistance = d3.geoDistance([d.long, d.lat], this.projection.invert([this.container.clientWidth / 2, this.container.clientHeight / 2]));
                    return gdistance > 1.57 ? 'none' : 'steelblue';
                })
                    .attr('r', 7);
                this.svg.selectAll(".marker-group")
                    .selectAll("text")
                    .data(this.data)
                    .enter()
                    .append("text")
                    .attr("x", (d) => this.projection([d.long, d.lat])[0])
                    .attr("y", (d) => this.projection([d.long, d.lat])[1] - 5)
                    .attr("fill", (d) => {
                    var gdistance = d3.geoDistance([d.long, d.lat], this.projection.invert([this.container.clientWidth / 2, this.container.clientHeight / 2]));
                    return gdistance > 1.57 ? 'none' : '#000';
                })
                    .attr("font-size", "14px")
                    .attr("font-family", "sans-serif")
                    .attr("text-anchor", "middle")
                    .text((d) => d.value);
            });
        });
    }
    stratLoaded(error, world, svg, names) {
        if (error)
            throw error;
        var nameMap = new Map();
        for (var i = 0; i < names.length; i++) {
            nameMap.set(parseInt(names[i].id), names[i].name);
        }
        var globe = { type: "Sphere" }, land = topojson.feature(world, world.objects.land), countries = topojson.feature(world, world.objects.countries), borders = topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; });
        countries = countries.features;
        svg.insert("path", ".graticule")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("fill", this.config.foregroundColor)
            .attr("d", this.path);
        for (var j = 0; j < countries.length; j++) {
            svg.insert("path", ".graticule")
                .datum(countries[j])
                .attr("fill", this.config.foregroundColor)
                .attr("d", this.path)
                .attr("class", "clickable")
                .attr("data-country-id", nameMap.get(parseInt(countries[j].id)) ? nameMap.get(parseInt(countries[j].id)) : countries[j].id)
                .on("mousemove", function () {
                var c = d3.select(this);
                c.attr("fill", "red");
            })
                .on("mouseout", function () {
                var c = d3.select(this);
                d3.select(this).attr("fill", "#f3de84");
            })
                .on("click", function () {
                var c = d3.select(this);
                console.log(c.attr("data-country-id"));
            });
        }
        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("fill", "none")
            .attr("stroke", this.config.bakcgroundColor)
            .attr("stroke-width", ".5px")
            .attr("d", this.path);
    }
    buildFromData(rootData) {
    }
}
exports.Earth = Earth;
//# sourceMappingURL=earth.js.map