export interface TimeSerieData {
    x: Date;
    id?: string;
    y: number;
    a: number;
}
export interface Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface ConfigurationTimeSerie<D extends TimeSerieData> {
    container: HTMLElement;
    data: string | Array<D>;
    threshold?: number;
    'stroke-dasharray'?: string;
    update?: string;
    color?: string;
    width?: number;
    height?: number;
    find?: Function;
    frequency?: number;
}
export declare class TimeSeries<D extends TimeSerieData> {
    private update();
    private svg;
    private container;
    private serieContainer;
    private annotationsContainer;
    private drawerContainer;
    private mousevline;
    private brush;
    private data;
    private config;
    private linepath;
    private line?;
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
    private last_id?;
    private interpolationFunction?;
    private isZoom;
    private width;
    private height;
    private drawerHeight;
    private drawerTopMargin;
    private color;
    private circleColor;
    xFixeDomain: Array<number>;
    yFixeDomain: Array<number>;
    margin: Margin;
    private container2;
    private min_zoom;
    private max_zoom;
    private text_size;
    build(config: ConfigurationTimeSerie<D>): void;
    private updateData(serie);
    private buildFromData(rootData);
    private createChart();
    private mousevlineUpdate();
    private yScaleFormat;
    private xScaleFormat(x);
    private drawSerie();
    private draw_circles();
    private updatefocusRing(xDate?);
    private mouseMove();
    private mouseOut();
    private updateTip(xDate?);
    private tipFunction(date, serieItem);
    private createLines();
    private getInterpolationFunction(serie);
    private drawMiniDrawer();
}
