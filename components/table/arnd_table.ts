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
export class Table<D> {

    private config: TableConfiguration<D>;
    private data: D[];
    private selection: d3.Selection<any, D, any, any>;

    public constructor() { }

    /**
     * Builds the table as specified by the given configuration (loads the data if any is given).
     * 
     * @param {TableConfiguration} config - the configuration
     */
    public build(config: TableConfiguration<D>) {
        this.config = config;
        this.loadData(<D[]>config.data);
    }

    /**
     * Loads or reloads the data, keeping all the other configuration unchanged.
     */
    public loadData(data: D[], emptyMessage?: string) {
        if (typeof data[0] == 'string') {
            throw new Error("invalid type of data: must be an object array");
        }

        this.data = data;
        this.config.container.innerHTML = "";
        if (!data || data.length == 0) {
            this.config.container.innerHTML = emptyMessage ? emptyMessage : "Empty data";
            return;
        }
        this.selection = d3.select(this.config.container);

        let table = this.selection.append('table') //
            .classed('table', true) //
            .style('border-collapse', "collapse", "important") //
            .classed('table-sm', this.config.small) //
            .classed("table-striped", this.config.striped) //
            .classed("table-bordered", this.config.bordered);
        var thead = table.append('thead');
        var tbody = table.append('tbody');

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(Object.keys(this.data[0])).enter()
            .append('th')
            .on('click', (d) => {
                if (this.config.headerClickHandler != null) {
                    this.config.headerClickHandler(Object.keys(this.data[0]).indexOf(d));
                }
            })
            .text(column => column);

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(this.data)
            .enter()
            .append('tr')
            .on('click', (d) => {
                if (this.config.selectableRows) {
                    rows.classed('table-active', false);
                    rows.filter(data => data === d).classed('table-active', true);
                }
                if (this.config.rowClickHandler != null) {
                    this.config.rowClickHandler(this.data.indexOf(d));
                }
            });

        rows.selectAll('td')
            .data(d => {
                return Object.keys(this.data[0]).map(function(k) {
                    return { 'value': d[k], 'name': k };
                });
            }).enter()
            .append('td')
            .attr('data-th', d => {
                return d.name;
            })
            .text(d => {
                return d.value;
            });

        if (!this.config.useBoostrapDataTable || this.config.useBoostrapDataTable === true) {
            ($(this.config.container.children[0])).DataTable();
        }

    }

    /**
     * Gets the data in the table.
     */
    public getData(): D[] {
        return this.data;
    }

}
