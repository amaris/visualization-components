/**
 * Typing for the table configuration object (to be passed to the table constructor).
 */
export interface TableConfiguration<D> {
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
export declare class Table<D> {
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
