export declare class DHelpers {
    static to_radians: number;
    static to_degrees: number;
    static cross(v0: any, v1: any): number[];
    static dot(v0: any, v1: any): number;
    static lonlat2xyz(coord: any): number[];
    static quaternion(v0: any, v1: any): number[];
    static euler2quat(e: any): number[];
    static quatMultiply(q1: any, q2: any): number[];
    static quat2euler(t: any): number[];
    static eulerAngles(v0: any, v1: any, o0: any): number[];
}
