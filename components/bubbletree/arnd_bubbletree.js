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
/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
export class BubbleTree {
    constructor() {
        this.selections = {};
    }
    update() {
        this.diameter = Math.min(this.config.container.clientWidth, this.config.container.clientHeight);
        this.width = this.config.container.clientWidth;
        this.height = this.config.container.clientHeight;
        if (NaN === this.diameter || this.diameter <= 0) {
            this.diameter = 1000;
            this.width = 1000;
            this.height = 1000;
        }
    }
    buildFromData(rootData) {
        this.rootData = rootData;
        let root = d3.hierarchy(rootData)
            .sum(d => d["weight"])
            .sort((a, b) => b.value - a.value);
        this.focus = root;
        let nodes = this.pack(root).descendants();
        this.circle = this.g.selectAll("circle")
            .data(nodes)
            .enter().append("circle").each(d => { if (d.data.uid == null)
            d.data.uid = "__generated_" + (BubbleTree.ID++); })
            .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root")
            .attr("id", d => d.data.uid ? "circle_" + d.data.uid : null)
            .style("display", d => !d.parent ? this.config.showRoot ? "inline" : "none" : "inline")
            .style("stroke", this.circleColor)
            .style("fill", d => this.nodeColor(d));
        let handlers = {
            "click": (d) => {
                if (!d.children) {
                    if (this.config.selectOnClick) {
                        this.clearSelect().select(d.data.uid);
                    }
                    if (this.config.onClick !== undefined) {
                        this.config.onClick(d);
                    }
                    else {
                        if (this.focus != d.parent) {
                            this.zoom(d.parent);
                        }
                    }
                    d3.event.stopPropagation();
                }
                else if (this.focus !== d) {
                    if (this.config.selectOnClick && this.config.allowParentSelection) {
                        this.clearSelect().select(d.data.uid);
                    }
                    this.zoom(d);
                    d3.event.stopPropagation();
                }
            },
            "mouseover": (d) => {
                if (this.getSelections().indexOf(d.data) < 0) {
                    this.setCircleFillColor(d, this.selectedLeafColor(100), 0.3);
                }
                if (d != this.focus && this.focus.ancestors().indexOf(d) < 0) {
                    this.showText(d, true);
                    while (d.parent != null /*&& d.parent!=this.focus*/) {
                        this.showText(d.parent, false);
                        d = d.parent;
                    }
                }
            },
            "mouseout": (d) => {
                this.setCircleFillColor(d, this.nodeColor(d));
                this.showText(d, d.parent === this.focus);
                if (this.config.nodePopover != null) {
                    $('.popover-node').popover("hide");
                }
            }
        };
        // merge handlers
        for (let userHandler in this.config.handlers) {
            if (handlers[userHandler]) {
                let handler = handlers[userHandler];
                // merge with user-defined handler
                handlers[userHandler] = d => {
                    handler(d);
                    this.config.handlers[userHandler](d);
                };
            }
            else {
                // install user handler
                handlers[userHandler] =
                    this.config.handlers[userHandler];
            }
        }
        // apply all handlers
        for (let handler in handlers) {
            console.info("installing handler " + handler);
            this.circle.on(handler, handlers[handler]);
        }
        this.g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("id", d => d.data.uid ? "text_" + d.data.uid : null)
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .style("pointer-events", "none")
            .style("font", "15px 'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("text-anchor", "middle")
            .style("fill", this.textColor)
            .text(d => d.data.name);
        this.svg.on("click", () => this.zoom(root));
        this.zoomTo([root.x, root.y, root.r * 2 + this.config.margin]);
        if (this.config.nodePopover != null) {
            let self = this;
            this.circle
                .classed("popover-node", true)
                .filter(function (d) {
                self.config.nodePopover(d, popover => {
                    if (popover && popover.content) {
                        this.setAttribute("data-content", popover.content);
                    }
                    if (popover && popover.title) {
                        this.setAttribute("data-original-title", popover.title);
                    }
                });
                return true;
            })
                .attr("rel", "popover")
                .attr("data-trigger", "click hover");
            $('.popover-node').popover();
        }
        if (this.config.onBuilt) {
            this.config.onBuilt(this);
        }
    }
    /**
     * Builds the buble tree diagram as specified by the given configuration.
     *
     * @param {BubbleTreeConfiguration} config - the configuration
     */
    build(config) {
        window.addEventListener("resize", e => {
            this.update();
            this.svg.select("g").remove();
            this.g = this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
            this.pack = d3.pack()
                .size([this.diameter - this.config.margin, this.diameter - this.config.margin])
                .padding(2);
            // use possible url field for backward compatibility
            if (config.data == null && config['url'] != null) {
                config.data = config['url'];
            }
            if (typeof config.data === 'string') {
                // URL case
                d3.json(config.data, (error, rootData) => {
                    console.log(rootData);
                    if (error)
                        throw error;
                    this.buildFromData(rootData);
                });
            }
            else {
                // data as JavaScript object
                this.buildFromData(config.data);
            }
        });
        this.config = config;
        this.config.container.innerHTML = "";
        this.config.container.innerHTML += "<div class='text-primary bg-warning'></div><div></div>";
        this.defaultColor = "hsla(220, 50%, 88%, 0.09)";
        this.textColor = window.getComputedStyle(this.config.container.children[1]).color;
        this.circleColor = this.defaultColor;
        //this.defaultLeafColor = window.getComputedStyle(document.body).backgroundColor;
        this.defaultLeafColor = this.selectedLeafColor(0);
        //this.circleColor = this.defaultLeafColor;
        this.selectedCircleColor = window.getComputedStyle(this.config.container.firstChild).color;
        console.info(this.selectedCircleColor);
        this.config.container.setAttribute("width", "100%");
        this.config.container.setAttribute("height", "100%");
        if (!this.config.handlers) {
            this.config.handlers = {};
        }
        this.config.showRoot = this.config.showRoot ? this.config.showRoot : false;
        this.config.baseLeafColorHue = this.config.baseLeafColorHue ? this.config.baseLeafColorHue : 30;
        this.config.baseLeafColorLight = this.config.baseLeafColorLight ? this.config.baseLeafColorLight : 50;
        this.svg = d3.select(config.container);
        if (!this.config.margin)
            this.config.margin = 20;
        this.update();
        console.info("diameter: " + this.diameter);
        this.g = this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
        this.pack = d3.pack()
            .size([this.diameter - this.config.margin, this.diameter - this.config.margin])
            .padding(2);
        // use possible url field for backward compatibility
        if (config.data == null && config['url'] != null) {
            config.data = config['url'];
        }
        if (typeof config.data === 'string') {
            // URL case
            d3.json(config.data, (error, rootData) => {
                console.log(rootData);
                if (error)
                    throw error;
                this.buildFromData(rootData);
            });
        }
        else {
            // data as JavaScript object
            this.buildFromData(config.data);
        }
    }
    /**
     * Get all the uids of the nodes matching the given names. Lookup is done within the chilren of the currently focussed node.
     */
    lookupNames(names) {
        let result = [];
        let root = this.getFocussedData();
        let upperCasedNames = names.map(n => n.toUpperCase());
        let lookup = (d) => {
            if (d.children) {
                d.children.forEach(d => {
                    if (upperCasedNames.indexOf(d.name.toUpperCase()) >= 0) {
                        result.push(d);
                    }
                });
                d.children.forEach(d => lookup(d));
            }
        };
        lookup(root);
        return result;
    }
    selectedLeafColor(saturation) {
        return "hsl(" + this.config.baseLeafColorHue + "," + (saturation * 100) + "%," + this.config.baseLeafColorLight + "%)";
    }
    nodeColor(d) {
        return d.data.color ? d.data.color : d.children ? this.defaultColor : this.selectedLeafColor(this.selections[d.data.uid] ? this.selections[d.data.uid] : 0);
    }
    /**
     * Zooms to a node represented by its uid.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid) {
        this.zoom(this.g.select("#circle_" + uid).datum());
        return this;
    }
    /**
     * Zooms back to the focussing node's parent.
     */
    zoomBack() {
        this.zoomToId(this.rootData.uid);
    }
    /**
     * Selects a node represented by its uid. The weight will determine the intensity of the selection color (0 to 1).
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @param {number} weight - the selection's weight (color intensity)
     */
    select(uid, weight = 1) {
        this.selections[uid] = weight;
        this.g.selectAll("circle")
            .filter(d => d.data.uid in this.selections)
            .classed("selected", true)
            .style("opacity", 1)
            .style("fill", d => this.selectedLeafColor(this.selections[d.data.uid]));
        return this;
    }
    /**
     * Selects node(s) accordingly to a selection function. The selection function should return a selection weight between 0 and 1.
     * Returning 0 or undefined means that the node is not selected.
     */
    selectData(selector) {
        this.g.selectAll("circle")
            .filter(d => { let weight = selector(d.data); if (weight && weight > 0) {
            this.selections[d.data.uid] = weight;
            return true;
        }
        else
            return false; })
            .classed("selected", true)
            .style("fill", d => this.selectedLeafColor(this.selections[d.data.uid]));
        return this;
    }
    /**
     * Clears all the selections.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @see #select
     */
    clearSelect() {
        let selections = this.selections;
        this.selections = {};
        this.g.selectAll("circle")
            .filter(d => d.data.uid in selections)
            .classed("selected", false)
            .style("fill", d => this.nodeColor(d));
        return this;
    }
    zoomTo(v) {
        if (this.config.nodePopover != null) {
            $('.popover-node').popover("hide");
        }
        var k = this.diameter / v[2];
        this.view = v;
        var node = this.g.selectAll("circle,text");
        node.attr("transform", d => "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")");
        this.circle.attr("r", d => d.r * k);
    }
    zoom(d) {
        let btc = this;
        this.focus = d;
        var transition = d3.transition()
            .duration(d3.event && d3.event.altKey ? 7500 : 750)
            .tween("zoom", () => {
            var i = d3.interpolateZoom(this.view, [this.focus.x, this.focus.y, this.focus.r * 2 + this.config.margin]);
            return t => this.zoomTo(i(t));
        });
        transition.select("#" + this.config.container.id).selectAll("text")
            .filter(function (d) { return d.parent && d.parent === btc.focus || this.style.display === "inline"; })
            .style("fill-opacity", d => d.parent === this.focus ? 1 : 0)
            .on("start", function (d) { if (d.parent === btc.focus)
            this.style.display = "inline"; })
            .on("end", function (d) { if (d.parent !== btc.focus)
            this.style.display = "none"; });
    }
    /**
     * Returns the root data as read from the JSON.
     *
     * @see build
     */
    getRootData() {
        return this.rootData;
    }
    /**
     * Returns the currently focussed node.
     */
    getFocussedData() {
        let data = this.rootData;
        if (this.focus) {
            data = this.focus.data;
        }
        return data;
    }
    /**
     * Returns the currently selected nodes uid with associated percentils).
     */
    getSelections() {
        return this.g.selectAll("circle")
            .filter(d => d.data.uid in this.selections).data().map(d => d.data);
    }
    showText(d, show = true) {
        this.g.selectAll("text").filter(data => data == d).style("fill-opacity", show ? "1" : "0").style("display", show ? "inline" : "none");
    }
    setCircleColor(d, color) {
        this.g.selectAll("circle").filter(data => data == d).style("stroke", color);
    }
    setCircleFillColor(d, color, opacity = 1) {
        this.g.selectAll("circle").filter(data => data == d).style("fill", color).style("opacity", opacity);
    }
}
BubbleTree.ID = 1;
//# sourceMappingURL=arnd_bubbletree.js.map