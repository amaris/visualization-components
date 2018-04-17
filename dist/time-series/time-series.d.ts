import * as d3 from 'd3';
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
    data: Array<IData>;
    options: ITimeSeriesOptions;
    threshold?: number;
    linepath?: d3.Selection<any, any, any, any>;
    line?: d3.Line<any>;
    'stroke-dasharray'?: string;
    interpolationFunction?: d3.CurveFactory;
    find?: Function;
}
export interface ITimeSeriesOptions {
    color?: string;
    interpolate?: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
    label?: string;
    name?: string;
    dashed?: boolean | string;
}
export declare class TimeSeries {
    private update();
    private svg;
    private container;
    private serieContainer;
    private annotationsContainer;
    private drawerContainer;
    private mousevline;
    private brush;
    private serie;
    private min;
    private max;
    private dateMin;
    private dateMax;
    private yScale;
    private xScale;
    private fullXScale;
    private yScaleLabel;
    private xScaleLabel;
    private tooltipDiv;
    private width;
    private height;
    private drawerHeight;
    private drawerTopMargin;
    private color;
    xFixeDomain: Array<number>;
    yFixeDomain: Array<number>;
    margin: IMargin;
    private container2;
    constructor(serie: ISimpleSerie);
    createChart(elem: string): void;
    private mousevlineUpdate();
    private yScaleFormat;
    private xScaleFormat(x);
    private drawSerie(serie);
    private updatefocusRing(xDate?);
    private mouseMove();
    private mouseOut();
    private updateTip(xDate?);
    private tipFunction(date, serieItem);
    private createLines(serie);
    private getInterpolationFunction(serie);
    private drawMiniDrawer();
}
