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

import { fk, functorkeyscale, keyNotNull } from './time-series-utils';

export interface IData {
    x: Date;
    y: number;
}

export interface IMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface ISerieItem {
    item: IData;
    options: ITimeSeriesOptions;
}

export interface ISimpleSerie {
    data: Array<IData>,
    options: ITimeSeriesOptions,
    threshold?: number,
    linepath?: d3.Selection<any, any, any, any>,
    line?: d3.Line<any>,
    'stroke-dasharray'?: string,
    interpolationFunction?: d3.CurveFactory,
    find?: Function
}

export interface ITimeSeriesOptions {
    color?: string,
    interpolate?: string,
    width?: number,
    height?: number,
    strokeWidth?: number,
    label?: string,
    name?: string,
    dashed?: boolean | string
}

export class TimeSeries {
  private svg: d3.Selection<any, any, any, any>;
  private container: d3.Selection<any, any, any, any>;
  private serieContainer: d3.Selection<any, any, any, any>;
  private annotationsContainer: d3.Selection<any, any, any, any>;
  private drawerContainer: d3.Selection<any, any, any, any>;
  private mousevline: d3.Selection<any, any, any, any>;
  private brush: d3.BrushBehavior<any> = d3.brushX();

  private serie: ISimpleSerie;
  private min: number;
  private max: number;
  private dateMin: Date;
  private dateMax: Date;

  private yScale: d3.ScaleLinear<any, any> = d3.scaleLinear();
  private xScale: d3.ScaleTime<any, any> = d3.scaleTime();
  private fullXScale: d3.ScaleTime<any, any>;
  private yScaleLabel: string = '';
  private xScaleLabel: string = '';
  private tooltipDiv: d3.Selection<any, any, any, any>;

  // default
  private width: number = 600;
  private height: number = 480;
  private drawerHeight: number = 80;
  private drawerTopMargin: number = 10;
  private color: string = '#000';

  public xFixeDomain: Array<number>;
  public yFixeDomain: Array<number>;
  public margin: IMargin = { top: 10, bottom: 20, left: 40, right: 10 };

  constructor(serie: ISimpleSerie) {
    const { options } = serie;

    if (options.color) {
      this.color = options.color;
    }
    if (options.width) {
      this.width = options.width;
    }
    if (options.height) {
      this.height = options.height;
    }

    this.serie = serie;
  }

  public createChart(elem: string) {
    // Compute mins max for the serie
    const extentY = d3.extent(this.serie.data, data => data.y);
    this.min = extentY[0];
    this.max = extentY[1];
    const extentX = d3.extent(this.serie.data, data => data.x);
    this.dateMin = extentX[0];
    this.dateMax = extentX[1];

    // Set scales
    this.yScale
      .range([this.height - this.margin.top - this.margin.bottom - this.drawerHeight - this.drawerTopMargin, 0])
      .domain([this.min, this.max])
      .nice();

    this.xScale
      .range([0, this.width - this.margin.left - this.margin.right])
      .domain([this.dateMin, this.dateMax])
      .nice();

    // If user specify domain
    if (this.yFixeDomain) {
      // for showing 0 :
      // chart.addSerie(...)
      //    .yscale.domain([0])
      if (this.yFixeDomain.length === 1) {
        this.yFixeDomain.push(this.yScale.domain()[1]);
      }
      this.yScale.domain(this.yFixeDomain);
    }

    if (this.xFixeDomain) {
      this.xScale.domain(this.xFixeDomain);
    }

    this.fullXScale = this.xScale.copy();

    // Create svg
    this.svg = d3.select(elem)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Clipping for scrolling in focus area
    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.height - this.margin.bottom - this.drawerHeight - this.drawerTopMargin)
      .attr('y', - this.margin.top);

    // Container for focus area
    this.container = this.svg
      .insert('g', "rect.mouse-catch")
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .attr('clip-path', 'url(#clip)');

    this.serieContainer = this.container.append('g');
    this.annotationsContainer = this.container.append('g');

    // Mini container at the bottom
    this.drawerContainer = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left},${(this.height - this.drawerHeight - this.margin.bottom)})`);

    // Vertical line moving with mouse tip
    this.mousevline = this.svg
      .append('g')
      .datum({
        x: new Date(),
        visible: false
      });
    this.mousevline
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', this.yScale.range()[0])
      .attr('y2', this.yScale.range()[1])
      .attr('class', 'd3_timeseries mousevline');

    // Update mouse vline
    this.mousevlineUpdate();

    const xAxis: d3.Axis<any> = d3.axisBottom(this.xScale).tickFormat(this.xScale.tickFormat());
    const yAxis: d3.Axis<any> = d3.axisLeft(this.yScale).tickFormat(this.yScaleFormat);

    this.brush.extent([
      [this.fullXScale.range()[0], 0],
      [this.fullXScale.range()[1], this.drawerHeight - this.drawerTopMargin]
    ])
      .on('brush', () => {
        const selection = d3.event.selection;
        this.xScale.domain(selection.map(this.fullXScale.invert, this.fullXScale));
        this.drawSerie(this.serie);
        this.svg.select(".focus.x.axis").call(xAxis);
        this.mousevlineUpdate();
        this.updatefocusRing();
      })

      .on('end', () => {
        const selection = d3.event.selection;
        if (selection === null) {
          this.xScale.domain(this.fullXScale.domain());
          this.drawSerie(this.serie);
          this.svg.select(".focus.x.axis").call(xAxis);
          this.mousevlineUpdate();
          this.updatefocusRing();
        }
      });

    this.svg
      .append('g')
      .attr('class', 'd3_timeseries focus x axis')
      .attr("transform",
        `translate(${this.margin.left},
          ${(this.height - this.margin.bottom - this.drawerHeight - this.drawerTopMargin)})`)
      .call(xAxis);

    this.drawerContainer
      .append('g')
      .attr('class', 'd3_timeseries x axis')
      .attr("transform", `translate(0, ${this.drawerHeight})`)
      .call(xAxis);

    this.drawerContainer.append("g")
      .attr("class", "d3_timeseries brush")
      .call(this.brush)
      .attr('transform', `translate(0, ${this.drawerTopMargin})`)
      .attr("height", (this.drawerHeight - this.drawerTopMargin));

    this.svg
      .append('g')
      .attr('class', 'd3_timeseries y axis')
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -this.margin.top - d3.mean(this.yScale.range()))
      .attr("dy", ".71em")
      .attr('y', -this.margin.left + 5)
      .style("text-anchor", "middle")
      .text(this.yScaleLabel);

    // Catch event for mouse tip
    this.svg
      .append('rect')
      .attr('width', this.width)
      .attr('class', 'd3_timeseries mouse-catch')
      .attr('height', this.height - this.drawerHeight)
      .style('opacity', 0)
      .on('mousemove', this.mouseMove.bind(this))
      .on('mouseout', this.mouseOut.bind(this));

    this.tooltipDiv = d3.select(elem)
      .style('position', 'relative')
      .append('div')
      .attr('class', 'd3_timeseries tooltip')
      .style('opacity', 0);

    this.createLines(this.serie);
    this.drawSerie(this.serie);
    this.drawMiniDrawer();
  }

  private mousevlineUpdate() {
    this.mousevline
      .attr('transform', (d: any) => {
        return `translate(${(this.margin.left + this.xScale(d.x))}, ${this.margin.top})`;
      })
      .style('opacity', (d: any) => {
        return d.visible ? 1 : 0;
      });
  };

  private yScaleFormat = this.yScale.tickFormat();
  private xScaleFormat(x: Date) {
    return x.toLocaleString();
  }

  private drawSerie(serie: ISimpleSerie) {
    if (!serie.linepath) {
      const linepath = this.serieContainer
        .append("path")
        .datum(serie.data)
        .attr('class', 'd3_timeseries line')
        .attr('d', serie.line)
        .attr('stroke', this.color)
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', serie.options.strokeWidth || 1.5)
        .attr('fill', 'none');

      if (serie.options.dashed) {
        if (serie.options.dashed == true || serie.options.dashed == 'dashed') {
          serie['stroke-dasharray'] = '5,5';
        } else if (serie.options.dashed == 'long') {
          serie['stroke-dasharray'] = '10,10';
        } else if (serie.options.dashed == 'dot') {
          serie['stroke-dasharray'] = '2,4';
        } else {
          serie['stroke-dasharray'] = serie.options.dashed;
        }
        linepath.attr('stroke-dasharray', serie['stroke-dasharray']);
      }
      serie.linepath = linepath;
    } else {
      serie.linepath.attr('d', serie.line);
    }
  }

  private updatefocusRing(xDate?: Date) {
    let s = this.annotationsContainer.selectAll("circle.d3_timeseries.focusring");
    if (xDate === null) {
      s = s.data([]);
    } else {
      s = s.data([{
        x: xDate,
        item: this.serie.find(xDate),
        color: this.color
      }].filter((d: any) => d.item && d.item.y));
    }

    s.transition()
      .duration(50)
      .attr('cx', (d: any) => this.xScale(d.item.x))
      .attr('cy', (d: any) => this.yScale(d.item.y));

    s.enter()
      .append("circle")
      .attr('class', 'd3_timeseries focusring')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('r', 5)
      .attr('stroke', fk('color'));

    s.exit().remove();
  }

  private mouseMove() {
    const x = this.xScale.invert(d3.mouse(this.container.node())[0]);
    this.mousevline.datum({ x: x, visible: true });
    this.mousevlineUpdate();
    this.updatefocusRing(x);
    this.updateTip(x);
  }

  private mouseOut() {
    this.mousevline.datum({ x: null, visible: false });
    this.mousevlineUpdate();
    this.updatefocusRing(null);
    this.updateTip(null);
  }

  private updateTip(xDate?: Date) {
    if (xDate === null) {
      this.tooltipDiv.style('opacity', 0);
    } else {
      const s = {
        item: this.serie.find(xDate),
        options: this.serie.options
      };

      this.tooltipDiv
        .style('opacity', 0.9)
        .style('left', `${(this.margin.left + 5 + this.xScale(xDate))}px`)
        .style('top', "0px")
        .html(this.tipFunction(xDate, s));
    }
  }

  private tipFunction(date: Date, serieItem: ISerieItem) {
    let spans = '';
    if (serieItem.item && serieItem.item.y) {
      spans = `<table style="border:none">
                <tr>
                  <td style="color: #000">${serieItem.options.label}</td>
                  <td style="color:#333333; text-align:right">${this.yScaleFormat(serieItem.item.y)}</td>
                </tr>
              </table>`
    }
    return `<h4>${this.xScaleFormat(d3.timeDay(date))}</h4>${spans}`;
  };

  private createLines(serie: ISimpleSerie) {
    // https://github.com/d3/d3-shape/blob/master/README.md#curves
    if (!serie.options.interpolate) {
      serie.options.interpolate = "linear";
    } else {
      // Translate curvenames
      serie.options.interpolate = (
        serie.options.interpolate === 'monotone' ? 'monotoneX'
          : serie.options.interpolate === 'step-after' ? 'stepAfter'
            : serie.options.interpolate === 'step-before' ? 'stepBefore'
              : serie.options.interpolate
      );
    }
    serie.interpolationFunction = this.getInterpolationFunction(serie) || d3.curveLinear;

    const drawLine = d3.line()
      .x(functorkeyscale('x', this.xScale))
        .y(functorkeyscale('y', this.yScale))
        .curve(d3.curveLinear/*serie.interpolationFunction*/)
      .defined(keyNotNull('y'));

    serie.line = drawLine;

    serie.options.label = serie.options.label || serie.options.name;

    serie.find = (date: Date) => {
      const bisect = d3.bisector(fk('x')).left;
      const i = bisect(serie.data, date) - 1;
      if (i === -1) {
        return null;
      }

      // Look to far after serie is defined
      if (i === serie.data.length - 1 &&
        serie.data.length > 1 &&
        Number(date) - Number(serie.data[i].x) > Number(serie.data[i].x) - Number(serie.data[i - 1].x)) {
        return null;
      }
      return serie.data[i];
    };
  }

  private getInterpolationFunction(serie: ISimpleSerie) {
    // To uppercase for d3 curve name
    const curveName: string = 'curve' + serie.options.interpolate[0].toUpperCase() + serie.options.interpolate.slice(1);
    const curveNames: any[] = [
      { curveLinear: d3.curveLinear },
      { curveStep: d3.curveStep },
      { curveStepBefore: d3.curveStepBefore },
      { curveStepAfter: d3.curveStepAfter },
      { curveBasis: d3.curveBasis },
      { curveCardinal: d3.curveCardinal },
      { curveMonotoneX: d3.curveMonotoneX },
      { curveCatmullRom: d3.curveCatmullRom }
    ];
    const curve: d3.CurveFactory[] = curveNames.filter((curve) => curveName === Object.keys(curve)[0]);
    return curve[0];
  }

  private drawMiniDrawer() {
    const smallyScale = this.yScale
      .copy()
      .range([this.drawerHeight - this.drawerTopMargin, 0]);
    const serie = this.serie;
    const drawLine: d3.Line<any> = d3.line()
      .x(functorkeyscale('x', this.fullXScale))
      .y(functorkeyscale('y', smallyScale))
      //.curve(serie.interpolationFunction)
       .curve(d3.curveLinear)
      .defined(keyNotNull('y'));
    const linepath = this.drawerContainer
      .insert("path", ":first-child")
      .datum(serie.data)
      .attr('class', 'd3_timeseries.line')
      .attr('transform', `translate(0,${this.drawerTopMargin})`)
      .attr('d', drawLine)
      .attr('stroke', this.color)
      .attr('stroke-width', serie.options.strokeWidth || 1.5)
      .attr('fill', 'none');

    if (serie.hasOwnProperty('stroke-dasharray')) {
      linepath.attr('stroke-dasharray', serie['stroke-dasharray']);
    }
  }
}
