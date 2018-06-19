/**
 * Specifies the data that can be found in a time serie.
 */
export interface TimeSerieData {
    /**
     * A timestamp for the data.
     */
    x: Date;
    /**
     * An optional ID.
     */
    id?: string;
    /**
     * The value of the data.
     */
    y: number;
    /**
     * An anomaly value. // TODO: have a better name?
     */
    a: number;
    description?: string;
    anomaly_description?: string;
}
export interface Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
/**
  * The configuration for the time serie component.
  */
export interface ConfigurationTimeSerie<D extends TimeSerieData> {
    /**
     * The container of the component.
     */
    container: HTMLElement;
    /**
     * The initial data, shown by the time serie, as a URL or an array of data.
     */
    data: string | Array<D>;
    threshold?: number;
    'stroke-dasharray'?: string;
    /**
     * An update URL to be called at the given frequency to update the data.
     */
    update?: string;
    color?: string;
    circleColor?: string;
    axisColor?: string;
    width?: number;
    height?: number;
    find?: Function;
    /**
     * The update frequency of the data. Default value is 1 second. Ignored if no update value is provided.
     */
    frequency?: number;
}
/**
 * A component to show time series.
 */
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
    private update_function;
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
    xFixeDomain: Array<number>;
    yFixeDomain: Array<number>;
    margin: Margin;
    private container2;
    private min_zoom;
    private max_zoom;
    private text_size;
    /**
     * Builds the time serie with the given configuration.
     * @param config the initial configuration
     */
    build(config: ConfigurationTimeSerie<D>): void;
    remove_update(): void;
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
