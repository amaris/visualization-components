/**
 * Typing for the list configuration object (to be passed to the list constructor).
 */
export interface ListConfiguration<D> {
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
export declare class List<D> {
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
