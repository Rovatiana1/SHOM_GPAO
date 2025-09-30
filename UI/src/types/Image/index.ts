
// export interface Point {
//     x: number;
//     y: number;
//     logicalX: number;
//     logicalY: number;
// }

// export type ReperePoint = [number, number];

// export interface Metadata {
//     origin_px: ReperePoint;
//     origin_value: ReperePoint;
//     x_max_px: ReperePoint;
//     y_max_px: ReperePoint;
//     x_max_value: number;
//     y_max_value: number;
//     Img_path: string; // This will just be the filename
// }

// export type DisplayMode = 'points' | 'cross' | 'line';

// export interface DateInfo {
//     date: string;
//     color: string;
// }


export interface Point {
    x: number;
    y: number;
    logicalX: number;
    logicalY: number;
    validationStatus?: 'pending' | 'valid' | 'error';
}

export type ReperePoint = [number, number];

export interface Metadata {
    origin_px: ReperePoint;
    origin_value: ReperePoint;
    x_max_px: ReperePoint;
    y_max_px: ReperePoint;
    x_max_value: number;
    y_max_value: number;
    Img_path: string; // This will just be the filename
}

export type DisplayMode = 'points' | 'cross' | 'line';

export interface DateInfo {
    date: string;
    color: string;
}