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

import * as d3 from 'd3';
import 'jquery';
import * as topojson from 'topojson-client';

export * from "./DHelpers";

import { queue } from 'd3';
import { DHelpers } from '../index';



export interface GeoData {
    uid: string;

    value?: number | string;

    lat: number;

    long: number;

    color?: string;
}

export interface EarthConfiguration<D extends GeoData> {

    container: HTMLElement | string;

    data: string | D;

    bakcgroundColor?: string;

    foregroundColor?: string;

    onclick?: Function;
}


export class Earth<D extends GeoData>{

    private svg: d3.Selection<any, any, any, any>;

    private config: EarthConfiguration<D>;

    private projection: any;

    private path: any;

    private container: HTMLElement;

    private data: D;

    private gpos0: any;


    public build(config: EarthConfiguration<D>) {
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

        if (!this.config.onclick) {
            this.config.onclick = this.onClickDefault;
        }

        if (typeof this.config.data == "string") {
            d3.json(<string>this.config.data, (error, rootData: any) => {
                this.buildFromData(rootData);

            });
        }
        else {
            this.data = this.config.data;
            this.createEarth();
        }
    }


    private createEarth() {
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.container.clientWidth)
            .attr('height', this.container.clientHeight)
            .attr('viewBox', '0, 0, ' + this.container.clientWidth + ', ' + this.container.clientHeight);

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
            .attr("fill","#2a468c")
            .attr("d", this.path);

        this.svg.append("use")
            .attr("class", "stroke")
            .attr("fill", "none")
            .attr("stroke","none")
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

        var drag = d3.drag()
            .on("start", () => this.gpos0 = this.projection.invert(d3.mouse(this.container)))
            .on("drag", () => {
                var gpos1 = this.projection.invert(d3.mouse(this.container));
                var rotation = this.projection.rotate();
                var eulerRotation = DHelpers.eulerAngles(this.gpos0, gpos1, rotation);
                this.projection.rotate(eulerRotation);
                this.svg.selectAll("path").attr("d", this.path);
            });

        var zoom = d3.zoom().scaleExtent([0.1, 7.0])
            .on("zoom", () => {
                this.svg.selectAll("path").attr("transform", d3.event.transform);
            });
        this.svg.call(zoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

        this.svg.call(drag);

        d3.json("/components/3Dmodel/world-110m.v1.json", (error, world: any) => {
            this.stratLoaded(error, world, this.svg);
        });



    }





    private stratLoaded(error, world, svg) {
        if (error) throw error;

        var globe = { type: "Sphere" },
            land = topojson.feature(world, world.objects.land),
            countries: any = topojson.feature(world, world.objects.countries),
            borders = topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; });

        countries = countries.features


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
                .attr("data-country-id", j);
        }

        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("fill", "none")
            .attr("stroke", this.config.bakcgroundColor)
            .attr("stroke-width", ".5px")
            .attr("d", this.path);

    }

    private buildFromData(rootData: any) {

    }

    private onClickDefault() {

    }
}

