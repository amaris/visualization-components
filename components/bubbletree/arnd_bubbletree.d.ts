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
     * The data's uid, to be used in the selection API.
     */
    uid: string;
    /**
     * The color of the data.
     */
    color?: string;
}
/**
 * Typing for the bubble tree configuration object (to be passed to the bubble tree constructor).
 */
interface BubbleTreeConfiguration {
    /**
     * The DOM SVG element that will contain the bubble tree.
     */
    container: HTMLElement;
    /**
     * The URL to fetch the data from.
     */
    url: string;
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
    colors?: {
        number: string;
    };
    /**
     * Hanler called when the user clicks on a node.
     */
    onClick: (handler: d3.pack.Node<Data>) => any;
}
/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
declare class BubbleTree {
    private svg;
    private margin;
    private diameter;
    private g;
    private defaultColor;
    private pack;
    private circle;
    private view;
    private focus;
    private static ID;
    private config;
    private selections;
    private rootData;
    /**
     * Builds the buble tree diagram as specified by the given configuration.
     *
     * @param {BubbleTreeConfiguration} config - the configuration
     */
    build(config: BubbleTreeConfiguration): void;
    private leafColor(saturation);
    private nodeColor(d);
    /**
     * Zooms to a node represented by its uid.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid: string): BubbleTree;
    /**
     * Selects a node represented by its uid. The weight will determine the intensity of the selection color (0 to 1).
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @param {number} weight - the selection's weight (color intensity)
     */
    select(uid: string, weight?: number): BubbleTree;
    /**
     * Clears all the selections.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     * @see #select
     */
    clearSelect(): BubbleTree;
    private zoomTo(v);
    private zoom(d);
    /**
     * Returns the root data as read from the JSON.
     *
     * @see build
     */
    getRootData(): Data;
    private nodeToText(d);
    private nodeToCircle(d);
    private showText(d, show?);
}
