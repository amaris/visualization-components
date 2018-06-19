import * as d3 from 'd3';
import 'jquery';
/**
 * The underlying JSON data to feed the bubble tree with.
 */
export interface Data {
    /**
     * The name of the data, or label of the node.
     */
    name: string;
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
    colors?: {
        number: string;
    };
    /**
     * Hanler called when the user clicks on a node.
     */
    onClick?: (handler: d3.HierarchyNode<D>) => any;
    /**
     * Hanler called when the user clicks on a node.
     */
    handlers?: {
        [eventType: string]: ((node: d3.HierarchyNode<D>) => any);
    };
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
    nodePopover?: (node: d3.HierarchyNode<D>, callback: (popover: {
        title?: string;
        content: string;
    }) => void) => void;
}
/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
export declare class BubbleTree<D extends Data> {
    private svg;
    private diameter;
    private width;
    private height;
    private g;
    private defaultColor;
    private textColor;
    private defaultLeafColor;
    private circleColor;
    private selectedCircleColor;
    private pack;
    private circle;
    private view;
    private focus;
    private static ID;
    private config;
    private selections;
    private rootData;
    constructor();
    private update();
    private buildFromData(rootData);
    /**
     * Builds the buble tree diagram as specified by the given configuration.
     *
     * @param {BubbleTreeConfiguration} config - the configuration
     */
    build(config: BubbleTreeConfiguration<D>): void;
    /**
     * Get all the uids of the nodes matching the given names. Lookup is done within the chilren of the currently focussed node.
     */
    lookupNames(names: string[]): Data[];
    private selectedLeafColor(saturation);
    private nodeColor(d);
    /**
     * Zooms to a node represented by its uid.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid: string): BubbleTree<D>;
    /**
     * Zooms back to the focussing node's parent.
     */
    zoomBack(): void;
    /**
     * Selects a node represented by its uid. The weight will determine the intensity of the selection color (0 to 1).
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @param {number} weight - the selection's weight (color intensity)
     */
    select(uid: string, weight?: number): BubbleTree<D>;
    /**
     * Selects node(s) accordingly to a selection function. The selection function should return a selection weight between 0 and 1.
     * Returning 0 or undefined means that the node is not selected.
     */
    selectData(selector: (data: D) => number): BubbleTree<D>;
    /**
     * Clears all the selections.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @see #select
     */
    clearSelect(): BubbleTree<D>;
    private zoomTo(v);
    private zoom(d);
    /**
     * Returns the root data as read from the JSON.
     *
     * @see build
     */
    getRootData(): Data;
    /**
     * Returns the currently focussed node.
     */
    getFocussedData(): Data;
    /**
     * Returns the currently selected nodes uid with associated percentils).
     */
    getSelections(): Data[];
    private showText(d, show?);
    private setCircleColor(d, color);
    private setCircleFillColor(d, color, opacity?);
}
