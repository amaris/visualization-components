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

/**
 * The underlying JSON data to feed the bubble tree with.
 */
interface Data {
    /**
     * The name of the data, or label of the node.
     */
    name: string;
    /**
     * The children.
     */
    children: Data[];
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
interface BubbleTreeConfiguration<D extends Data> {
    /**
     * The DOM SVG element that will contain the bubble tree.
     */
    container: HTMLElement;
    /**
     * The data holding the tree.
     */
    data: string | D;
    /**
     * The color hue for base leafs (default is 110). See http://hslpicker.com/ to check out the meaning of hue.
     */
    baseLeafColorHue?: number;
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
    onClick?: (handler: d3.pack.Node<D>) => any;
    /**
     * Hanler called when the user clicks on a node.
     */
    handlers?: { [eventType: string]: ((node: d3.pack.Node<D>) => any) };
    /**
     * True to select the clicked leaf node.
     */
    selectOnClick?: boolean;
    /**
     * The margin size around the bubble tree.
     */
    margin?: number;
    /**
     * On built callback.
     */
    onBuilt?: (bubbleTree: BubbleTree<D>) => any;
}

/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
class BubbleTree<D extends Data> {

    private svg: d3.Selection<any>;
    private diameter: number;
    private width: number;
    private height: number;
    private g: d3.Selection<any>;

    private defaultColor: d3.scale.Linear<any, any>;

    private pack: d3.Pack<any>;

    private circle: d3.Selection<d3.pack.Node<D>>;
    private view;
    private focus: d3.pack.Node<D>;
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
        this.rootData = rootData;
        let root = <any>d3.hierarchy(rootData)
            .sum(d => d["weight"])
            .sort((a, b) => b.value - a.value);

        this.focus = root;
        let nodes = this.pack(root).descendants();

        this.circle = this.g.selectAll("circle")
            .data<d3.pack.Node<D>>(nodes)
            .enter().append("circle").each(d => { if (d.data.uid == null) d.data.uid = "__generated_" + (BubbleTree.ID++); })
            .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root")
            .attr("id", d => d.data.uid ? "circle_" + d.data.uid : null)
            .style("display", d => !d.parent ? this.config.showRoot ? "inline" : "none" : "inline")
            .style("stroke", "#B0B0B0")
            .style("fill", d => this.nodeColor(d));

        let handlers = {
            "click": (d: d3.pack.Node<D>) => {
                if (!d.children) {
                    if (this.config.selectOnClick) {
                        this.clearSelect().select(d.data.uid);
                    }
                    if (this.config.onClick !== undefined) {
                        this.config.onClick(d);
                    } else {
                        this.zoom(d.parent);
                    }
                    d3.event.stopPropagation();
                } else if (this.focus !== d) {
                    this.zoom(d);
                    d3.event.stopPropagation();
                }
            },
            "mouseover": (d: d3.pack.Node<Data>) => {
                if (d != this.focus) {
                    this.showText(d, true);
                    while (d.parent != null /*&& d.parent!=this.focus*/) {
                        this.showText(d.parent, false);
                        d = d.parent;
                    }
                }
            },
            "mouseout": (d: d3.pack.Node<Data>) => {
                if (d.parent !== this.focus) {
                    this.showText(d, false);
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
            .data<d3.pack.Node<Data>>(nodes)
            .enter().append("text")
            .attr("id", d => d.data.uid ? "text_" + d.data.uid : null)
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .style("pointer-events", "none")
            .style("font", "15px 'Helvetica Neue', Helvetica, Arial, sans-serif")
            .style("text-anchor", "middle")
            .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff")
            .text(d => d.data.name);

        this.svg.on("click", () => this.zoom(root));

        this.zoomTo([root.x, root.y, root.r * 2 + this.config.margin]);

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
        this.config = config;
        this.config.container.innerHTML = "";
        this.config.container.setAttribute("width", "100%");
        this.config.container.setAttribute("height", "100%");
        if (!this.config.handlers) {
            this.config.handlers = {};
        }
        this.config.showRoot = this.config.showRoot ? this.config.showRoot : false;
        this.config.baseLeafColorHue = this.config.baseLeafColorHue ? this.config.baseLeafColorHue : 70;
        this.svg = d3.select(config.container);
        if (!this.config.margin) this.config.margin = 20;
        this.update();
        console.info("diameter: " + this.diameter);
        this.g = this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

        this.defaultColor = d3.scaleLinear()
            .domain([-1, 5])
            .range(["hsl(197,30%,98%)", "hsl(220,50%,88%)"])
            .interpolate(d3.interpolateHcl);

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
                if (error) throw error;
                this.buildFromData(rootData);
            });
        } else {
            // data as JavaScript object
            this.buildFromData(<D>config.data);
        }

    }

    private leafColor(saturation: number): string {
        return "hsl(" + this.config.baseLeafColorHue + "," + (saturation * 100) + "%,70%)";
    }

    private nodeColor(d: d3.pack.Node<Data>): string {
        return d.data.color ? d.data.color : d.children ? this.defaultColor(d.depth) : this.leafColor(0);
    }

    /**
     * Zooms to a node represented by its uid.
     * 
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid: string): BubbleTree<D> {
        this.zoom(d3.select("#circle_" + uid).datum());
        return this;
    }

    /**
     * Selects a node represented by its uid. The weight will determine the intensity of the selection color (0 to 1).
     * 
     * @param {string} uid - the uid of the node to be zoomed to
     * @param {number} weight - the selection's weight (color intensity)
     */
    select(uid: string, weight: number = 1): BubbleTree<D> {
        this.selections[uid] = weight;
        this.g.selectAll("circle")
            .filter(d => d.data.uid in this.selections)
            .classed("selected", true)
            .style("fill", d => this.leafColor(this.selections[d.data.uid]));
        return this;
    }

    /**
     * Clears all the selections.
     * 
     * @param {string} uid - the uid of the node to be zoomed to
     * @see #select
     */
    clearSelect(): BubbleTree<D> {
        this.g.selectAll("circle")
            .filter(d => d.data.uid in this.selections)
            .classed("selected", false)
            .style("fill", d => this.nodeColor(d));
        this.selections = {};
        return this;
    }

    private zoomTo(v) {
        var k = this.diameter / v[2]; this.view = v;
        var node = this.g.selectAll("circle,text");
        node.attr("transform", d => "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")");
        this.circle.attr("r", d => d.r * k);
    }

    private zoom(d) {
        this.focus = d;

        var transition = d3.transition()
            .duration(d3.event && (<any>d3.event).altKey ? 7500 : 750)
            .tween("zoom", () => {
                var i = d3.interpolateZoom(this.view, [this.focus.x, this.focus.y, this.focus.r * 2 + this.config.margin]);
                return t => this.zoomTo(i(t));
            });

        transition.select("#" + this.config.container.id).selectAll("text")
            .filter(d => d.parent && d.parent === this.focus || this.nodeToText(d).style.display === "inline")
            .style("fill-opacity", d => d.parent === this.focus ? 1 : 0)
            .on("start", d => { if (d.parent === this.focus) this.nodeToText(d).style.display = "inline"; })
            .on("end", d => { if (d.parent !== this.focus) this.nodeToText(d).style.display = "none"; });
    }

    /**
     * Returns the root data as read from the JSON.
     * 
     * @see build
     */
    getRootData(): Data {
        return this.rootData;
    }

    private nodeToText(d): HTMLElement {
        return document.getElementById("text_" + d.data.uid);
    }

    private nodeToCircle(d): HTMLElement {
        return document.getElementById("circle_" + d.data.uid);
    }

    private showText(d, show: boolean = true) {
        let text: HTMLElement = this.nodeToText(d);
        if (text) {
            text.style.fillOpacity = show ? "1" : "0";
            text.style.display = show ? "inline" : "none";
        }
    }

}
