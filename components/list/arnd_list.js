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
 * An interactive D3.js component to render items in a list.
 */
export class List {
    constructor() { }
    /**
     * Builds the list as specified by the given configuration (loads the data if any is given).
     *
     * @param {ListConfiguration} config - the configuration
     */
    build(config) {
        this.config = config;
        this.loadData(config.data);
    }
    /**
     * Loads or reloads the data, keeping all the other configuration unchanged.
     */
    loadData(data, emptyMessage) {
        this.data = data;
        this.config.container.innerHTML = "";
        if (!data || data.length == 0) {
            this.config.container.innerHTML = emptyMessage ? emptyMessage : "Empty data";
            return;
        }
        this.selection = d3.select(this.config.container);
        let list = this.selection.append('ul').classed("list-group", true);
        // create a row for each object in the data
        var rows = list.selectAll('li')
            .data(this.data)
            .enter()
            .append('li')
            .classed('list-group-item', true)
            .text(d => "" + d)
            .on('click', (d) => {
            if (this.config.selectableRows) {
                rows.classed('active', false);
                rows.filter(data => data === d).classed('active', true);
            }
            if (this.config.rowClickHandler != null) {
                this.config.rowClickHandler(this.data.indexOf(d));
            }
        });
        //list.style('overflow-y', 'scroll');
        //padding:0px;max-height:200px;overflow-y:scroll
    }
    /**
     * Gets the data in the list.
     */
    getData() {
        return this.data;
    }
}
//# sourceMappingURL=arnd_list.js.map