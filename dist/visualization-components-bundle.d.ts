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
    colors?: {
        number: string;
    };
    /**
     * Hanler called when the user clicks on a node.
     */
    onClick?: (handler: d3.pack.Node<D>) => any;
    /**
     * Hanler called when the user clicks on a node.
     */
    handlers?: {
        [eventType: string]: ((node: d3.pack.Node<D>) => any);
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
}
/**
 * An interactive D3.js component to render trees as an SVG flat bubble tree.
 */
declare class BubbleTree<D extends Data> {
    private svg;
    private diameter;
    private width;
    private height;
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
    constructor();
    private update();
    private buildFromData(rootData);
    /**
     * Builds the buble tree diagram as specified by the given configuration.
     *
     * @param {BubbleTreeConfiguration} config - the configuration
     */
    build(config: BubbleTreeConfiguration<D>): void;
    private leafColor(saturation);
    private nodeColor(d);
    /**
     * Zooms to a node represented by its uid.
     *
     * @param {string} uid - the uid of the node to be zoomed to
     */
    zoomToId(uid: string): BubbleTree<D>;
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
     * Returns the currently selected nodes uid with associated percentils).
     */
    getSelections(): Data[];
    private showText(d, show?);
    private setCircleColor(d, color);
}
/**
 * Typing for the list configuration object (to be passed to the list constructor).
 */
interface ListConfiguration<D> {
    /**
     * The DOM SVG element that will contain the list.
     */
    container: HTMLElement;
    /**
     * The data to be shown in the list.
     */
    data: string | D[];
    /**
     * Callback when a cell is clicked.
     */
    rowClickHandler?: (row: number) => void;
    /**
     * Tells if this list allows row selection.
     */
    selectableRows?: boolean;
}
/**
 * An interactive D3.js component to render items in a list.
 */
declare class List<D> {
    private config;
    private data;
    private selection;
    constructor();
    /**
     * Builds the list as specified by the given configuration (loads the data if any is given).
     *
     * @param {ListConfiguration} config - the configuration
     */
    build(config: ListConfiguration<D>): void;
    /**
     * Loads or reloads the data, keeping all the other configuration unchanged.
     */
    loadData(data: D[], emptyMessage?: string): void;
    /**
     * Gets the data in the list.
     */
    getData(): D[];
}
/**
 * Typing for the table configuration object (to be passed to the table constructor).
 */
interface TableConfiguration<D> {
    /**
     * The DOM SVG element that will contain the table.
     */
    container: HTMLElement;
    /**
     * The data to be shown in the table.
     */
    data: string | D[];
    /**
     * Callback when the header is clicked.
     */
    headerClickHandler?: (column: number) => void;
    /**
     * Callback when a cell is clicked.
     */
    rowClickHandler?: (row: number) => void;
    /**
     * Tells if this table uses bootstrap 4 data tables for pagination and filtering (default is true).
     */
    useBoostrapDataTable?: boolean;
    /**
     * Tells if this table is using striped rows for rendering.
     */
    striped?: boolean;
    /**
     * Tells if showing a table border.
     */
    bordered?: boolean;
    /**
     * Tells if this table allows row selection.
     */
    selectableRows?: boolean;
    /**
     * Tells if this table uses small rendering.
     */
    small?: boolean;
    /**
     * Sets the optional title.
     */
    title?: string;
}
/**
 * An interactive D3.js component to render objects in a table.
 */
declare class Table<D> {
    private config;
    private data;
    private selection;
    constructor();
    /**
     * Builds the table as specified by the given configuration (loads the data if any is given).
     *
     * @param {TableConfiguration} config - the configuration
     */
    build(config: TableConfiguration<D>): void;
    /**
     * Loads or reloads the data, keeping all the other configuration unchanged.
     */
    loadData(data: D[], emptyMessage?: string): void;
    /**
     * Gets the data in the table.
     */
    getData(): D[];
}
