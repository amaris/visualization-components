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
// TODO.
//import 'bootstrap';

/**
 * The underlying JSON data to feed the bubble tree with.
 */
export interface Data {
    /**
     * The name of the data, or label of the node.
     */
    name?: string;
    /**
     * The children.
     */
    children?: Data[];
    /**
     * The data's uid, to be used in the selection API (automatically added if not found).
     */
    uid?: string;
    /**
     * The color of the data.
     */
    color?: string;
    /**
     * The weight.
     */
    weight?: number;
}

/**
 * Typing for the bubble tree configuration object (to be passed to the bubble tree constructor).
 */
export interface BubbleTreeConfiguration<D extends Data> {
    /**
     * The DOM SVG element that will contain the bubble tree.
     */
    container: HTMLElement;
    /**
     * The data holding the tree.
     */
    data: string | D;
    /**
     * The field holding the name in the data (defaults to "name").
     */
    nameField?: string;
    /**
     * The field holding the children in the data (defaults to "children").
     */
    childrenField?: string;
    /**
     * The color hue for base leafs (default is 110). See http://hslpicker.com/ to check out the meaning of hue.
     */
    baseLeafColorHue?: number;
    baseLeafColorLight?: number;
    /**
     * Show the root node circle (default is false).
     */
    showRoot?: boolean;
    /**
     * Colors by depth (0 = root). If undefined, will fallback to default colors.
     */
    colors?: { number: string };
    /**
     * Hanler called when the user clicks on a node.
     */
    onClick?: (handler: d3.HierarchyNode<D>) => any;
    /**
     * Hanler called when the user clicks on a node.
     */
    handlers?: { [eventType: string]: ((node: d3.HierarchyNode<D>) => any) };
    /**
     * True to select the clicked leaf node.
     */
    selectOnClick?: boolean;
    /**
     * True to allow non-leaf nodes to be selected.
     */
    allowParentSelection?: boolean;
    /**
     * The margin size around the bubble tree.
     */
    margin?: number;
    /**
     * On built callback.
     */
    onBuilt?: (bubbleTree: BubbleTree<D>) => any;
    /**
     * A function to create a popover on a node. It can return undefined when no popover needs to be shown.
     */
    nodePopover?: (node: d3.HierarchyNode<D>, callback: (popover: { title?: string, content: string }) => void) => void;
}

/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
export class BubbleTree<D extends Data> {

    private svg: d3.Selection<any, d3.HierarchyNode<D>, any, any>;
    private diameter: number;
    private width: number;
    private height: number;
    private g: d3.Selection<any, d3.HierarchyNode<D>, any, any>;

    private defaultColor: string;
    private textColor: string;
    private defaultLeafColor: string;
    private circleColor: string;
    private selectedCircleColor: string;

    private pack: d3.PackLayout<any>;

    private circle: d3.Selection<any, d3.HierarchyNode<D>, any, any>;
    private view;
    private focus: any;
    private static ID: number = 1;
    private config: BubbleTreeConfiguration<D>;
    private selections: {} = {};
    private rootData: Data;

    public constructor() { }

    private update() {
        this.diameter = Math.min(this.config.container.clientWidth, this.config.container.clientHeight);
        this.width = this.config.container.clientWidth;
        this.height = this.config.container.clientHeight;
        if (NaN === this.diameter || this.diameter <= 0) {
            this.diameter = 1000;
            this.width = 1000;
            this.height = 1000;
        }
    }

    private buildFromData(rootData: Data) {
        this.adaptChildrenField(rootData);
        this.rootData = rootData;
        let root = <any>d3.hierarchy(rootData)
            .sum(d => d["weight"])
            .sort((a, b) => b.value - a.value);

        this.focus = root;
        let nodes = this.pack(root).descendants();

        this.circle = this.g.selectAll("circle")
            .data<d3.HierarchyNode<D>>(nodes)
            .enter().append("circle").each(d => { if (d.data.uid == null) d.data.uid = "__generated_" + (BubbleTree.ID++); })
            .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root")
            .attr("id", d => d.data.uid ? "circle_" + d.data.uid : null)
            .style("display", d => !d.parent ? this.config.showRoot ? "inline" : "none" : "inline")
            .style("stroke", this.circleColor)
            .style("fill", d => this.nodeColor(d));

        let handlers = {
            "click": (d: d3.HierarchyNode<D>) => {
                if (!d.children) {
                    if (this.config.selectOnClick) {
                        this.clearSelect().select(d.data.uid);
                    }
                    if (this.config.onClick !== undefined) {
                        this.config.onClick(d);
                    } else {
                        if (this.focus != d.parent) {
                            this.zoom(d.parent);
                        }
                    }
                    d3.event.stopPropagation();
                } else if (this.focus !== d) {
                    if (this.config.selectOnClick && this.config.allowParentSelection) {
                        this.clearSelect().select(d.data.uid);
                    }
                    this.zoom(d);
                    d3.event.stopPropagation();
                }
            },
            "mouseover": (d: d3.HierarchyNode<Data>) => {
                if (this.getSelections().indexOf(d.data) < 0) {
                    this.setCircleFillColor(d, this.selectedLeafColor(100), 0.3);
                }

                //if(d != this.focus && this.focus.ancestors().indexOf(d) < 0) {
                let displayed = false;
                if (d.children != null) {
                    const nonTerminalNodes = d.children.filter(c => c.children != null && c.children.length > 0);
                    displayed = nonTerminalNodes.length !== 0 || d == this.focus;
                    d.children.forEach(c => {
                        this.showText(c, displayed);
                        if (c.children != null && c.children.length > 0) {
                            c.children.forEach(b => {
                                this.showText(b, false);
                            });
                        }
                    });
                }
                this.showText(d, !displayed);

                while (d.parent != null /*&& d.parent!=this.focus*/) {
                    this.showText(d.parent, false);
                    d = d.parent;
                }
                //}
            },
            "mouseout": (d: d3.HierarchyNode<Data>) => {
                if (this.getSelections().indexOf(d.data) < 0) {
                    this.setCircleFillColor(d, this.nodeColor(d));
                }
                //this.showText(d, d.parent === this.focus);
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
            } else {
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
            .data<d3.HierarchyNode<Data>>(nodes)
            .enter().append("text")
            .attr("id", d => d.data.uid ? "text_" + d.data.uid : null)
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .style("pointer-events", "none")
            .style("font", "15px 'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("text-anchor", "middle")
            .style("fill", this.textColor)
            .text(d => d.data[this.config.nameField]);

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
    build(config: BubbleTreeConfiguration<D>) {
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
                this.buildFromData((<any>config).dataCache);
            } else {
                // data as JavaScript object
                this.buildFromData(<D>config.data);
            }
        })
        this.config = config;
        this.config.container.innerHTML = "";
        this.config.container.innerHTML += "<div class='text-primary bg-warning'></div><div></div>";
        this.defaultColor = "hsla(220, 50%, 88%, 0.09)";
        this.textColor = window.getComputedStyle(<HTMLElement>this.config.container.children[1]).color;
        this.circleColor = this.defaultColor;
        //this.defaultLeafColor = window.getComputedStyle(document.body).backgroundColor;
        this.defaultLeafColor = this.selectedLeafColor(0);
        //this.circleColor = this.defaultLeafColor;
        this.selectedCircleColor = window.getComputedStyle(<HTMLElement>this.config.container.firstChild).color;
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
        if (!this.config.margin) this.config.margin = 20;
        if (!this.config.childrenField) this.config.childrenField = "children";
        if (!this.config.nameField) this.config.nameField = "name";

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
            d3.json(<string>config.data, (error, rootData: Data) => {
                console.log(rootData);
                (<any>this.config).dataCache = rootData;
                if (error) throw error;
                this.buildFromData(rootData);
            });
        } else {
            // data as JavaScript object
            this.buildFromData(<D>config.data);
        }

    }

    adaptChildrenField(root: Data) {
        if (this.config.childrenField == "children") return;
        let adapt = (d: Data) => {
            if (d[this.config.childrenField]) {
                d.children = d[this.config.childrenField];
                d.children.forEach(d => adapt(d));
            }
        }
        adapt(root);
    }

    /**
     * Get all the uids of the nodes matching the given names. Lookup is done within the chilren of the currently focussed node.
     */
    lookupNames(names: string[]): Data[] {
        let result: Data[] = [];
        let root = this.getFocussedData();
        let upperCasedNames = names.map(n => n.toUpperCase());
        let lookup = (d: Data) => {
            if (d.children) {
                d.children.forEach(d => {
                    if (upperCasedNames.indexOf(d[this.config.nameField].toUpperCase()) >= 0) {
                        result.push(d);
                    }
                });
                d.children.forEach(d => lookup(d));
            }
        }
        lookup(root);
        return result;
    }

    private selectedLeafColor(saturation: number): string {
        return "hsl(" + this.config.baseLeafColorHue + "," + (saturation * 100) + "%," + this.config.baseLeafColorLight + "%)";
    }

    private nodeColor(d: d3.HierarchyNode<Data>): string {
        return d.data.color ? d.data.color : d.children ? this.defaultColor : this.selectedLeafColor(this.selections[d.data.uid] ? this.selections[d.data.uid] : 0);
    }

    /**
     * Zooms to a node represented by its uid.
     * 
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid: string): BubbleTree<D> {
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
    select(uid: string, weight: number = 1): BubbleTree<D> {
        this.selections[uid] = weight;
        this.g.selectAll<any, d3.HierarchyNode<D>>("circle")
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
    selectData(selector: (data: D) => number): BubbleTree<D> {
        this.g.selectAll<any, d3.HierarchyNode<D>>("circle")
            .filter(d => { let weight = selector(d.data); if (weight && weight > 0) { this.selections[d.data.uid] = weight; return true } else return false; })
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
    clearSelect(): BubbleTree<D> {
        let selections = this.selections;
        this.selections = {};
        this.g.selectAll<any, d3.HierarchyNode<D>>("circle")
            .filter(d => d.data.uid in selections)
            .classed("selected", false)
            .style("fill", d => this.nodeColor(d));
        return this;
    }

    private zoomTo(v) {
        if (this.config.nodePopover != null) {
            $('.popover-node').popover("hide");
        }
        var k = this.diameter / v[2]; this.view = v;
        var node = this.g.selectAll<any, any>("circle,text");
        node.attr("transform", d => "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")");
        this.circle.attr("r", d => (<any>d).r * k);
    }

    private zoom(d) {

        let btc = this;
        this.focus = d;

        var transition = d3.transition()
            .duration(d3.event && (<any>d3.event).altKey ? 7500 : 750)
            .tween("zoom", () => {
                var i = d3.interpolateZoom(this.view, [this.focus.x, this.focus.y, this.focus.r * 2 + this.config.margin]);
                return t => this.zoomTo(i(t));
            });

        transition.select("#" + this.config.container.id).selectAll<any, d3.HierarchyNode<D>>("text")
            .filter(function (d) { return d.parent && d.parent === btc.focus || this.style.display === "inline"; })
            .style("fill-opacity", d => d.parent === this.focus ? 1 : 0)
            .on("start", function (d) { if (d.parent === btc.focus) this.style.display = "inline"; })
            .on("end", function (d) { if (d.parent !== btc.focus) this.style.display = "none"; });
    }

    /**
     * Returns the root data as read from the JSON.
     * 
     * @see build
     */
    getRootData(): Data {
        return this.rootData;
    }

    /**
     * Returns the currently focussed node.
     */
    getFocussedData(): Data {
        let data = this.rootData;
        if (this.focus) {
            data = this.focus.data;
        }
        return data;
    }

    /**
     * Returns the currently selected nodes uid with associated percentils).
     */
    getSelections(): Data[] {
        return this.g.selectAll<any, d3.HierarchyNode<D>>("circle")
            .filter(d => d.data.uid in this.selections).data().map(d => d.data);

    }

    private showText(d, show: boolean = true) {
        this.g.selectAll("text").filter(data => data == d).style("fill-opacity", show ? "1" : "0").style("display", show ? "inline" : "none");
    }

    private setCircleColor(d, color: string) {
        this.g.selectAll("circle").filter(data => data == d).style("stroke", color);
    }

    private setCircleFillColor(d, color: string, opacity: number = 1) {
        this.g.selectAll("circle").filter(data => data == d).style("fill", color).style("opacity", opacity);
    }

}
