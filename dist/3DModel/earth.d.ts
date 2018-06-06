import 'jquery';
export * from "./DHelpers";
export interface GeoData {
    uid: string;
    value?: number | string;
    lat: number;
    long: number;
    color?: string;
}
export interface EarthConfiguration<D extends GeoData> {
    container: HTMLElement | string;
    data: string | D;
    bakcgroundColor?: string;
    foregroundColor?: string;
    onclick?: Function;
}
export declare class Earth<D extends GeoData> {
    private svg;
    private config;
    private projection;
    private path;
    private container;
    private data;
    private gpos0;
    build(config: EarthConfiguration<D>): void;
    private createEarth();
    private stratLoaded(error, world, svg);
    private buildFromData(rootData);
    private onClickDefault();
}
