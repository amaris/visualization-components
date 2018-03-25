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
}

/**
 * An interactive D3.js component to render objects in a table.
 */
class Table<D> {

    private config: TableConfiguration<D>;
    private data: D[];
    private selection: d3.Selection<any>;

    public constructor() { }

    /**
     * Builds the table as specified by the given configuration.
     * 
     * @param {TableConfiguration} config - the configuration
     */
    build(config: TableConfiguration<D>) {
        this.data = <D[]>config.data;
        this.config = config;
        this.config.container.innerHTML = "";
        this.selection = d3.select(config.container);

        let table = this.selection.append('table').classed('table', true);
        var thead = table.append('thead').classed('thead-light', true);
        var tbody = table.append('tbody');

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(Object.keys(this.data[0])).enter()
            .append('th')
            .text(column => column);

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(this.data)
            .enter()
            .append('tr');

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
    }

}
