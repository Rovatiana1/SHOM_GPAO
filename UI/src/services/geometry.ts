// import { Metadata, ReperePoint } from "../../../../types/Image";

import { Metadata, ReperePoint } from "../types/Image";


export const pixelToLogical = (point: { x: number, y: number }, metadata: Metadata): { logicalX: number, logicalY: number } => {
    const [origin_x_px, origin_y_px] = metadata.origin_px;
    const [origin_x_val, origin_y_val] = metadata.origin_value;
    const [x_max_px] = metadata.x_max_px;
    const [, y_max_px] = metadata.y_max_px;
    const x_max_val = metadata.x_max_value;
    const y_max_val = metadata.y_max_value;

    const logical_x_range = x_max_val - origin_x_val;
    const logical_y_range = y_max_val - origin_y_val;
    
    const pixel_x_range = x_max_px - origin_x_px;
    const pixel_y_range = origin_y_px - y_max_px; // Y axis is inverted in pixels

    const scaleX = pixel_x_range !== 0 ? logical_x_range / pixel_x_range : 0;
    const scaleY = pixel_y_range !== 0 ? logical_y_range / pixel_y_range : 0;

    const logicalX = (point.x - origin_x_px) * scaleX + origin_x_val;
    const logicalY = (origin_y_px - point.y) * scaleY + origin_y_val;

    return { logicalX, logicalY };
};

export const rotatePoint = (point: ReperePoint, center: ReperePoint, angle: number): ReperePoint => {
    const [px, py] = point;
    const [cx, cy] = center;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = (cos * (px - cx)) + (sin * (py - cy)) + cx;
    const ny = (cos * (py - cy)) - (sin * (px - cx)) + cy;
    return [nx, ny];
};



export const logicalToPixel = (logicalPoint: { logicalX: number, logicalY: number }, metadata: Metadata): { x: number, y: number } => {
    const [origin_x_px, origin_y_px] = metadata.origin_px;
    const [origin_x_val, origin_y_val] = metadata.origin_value;
    const x_max_px_coord = metadata.x_max_px[0];
    const y_max_px_coord = metadata.y_max_px[1];
    const x_max_val = metadata.x_max_value;
    const y_max_val = metadata.y_max_value;

    const logical_x_range = x_max_val - origin_x_val;
    const logical_y_range = y_max_val - origin_y_val;
    
    const pixel_x_range = x_max_px_coord - origin_x_px;
    const pixel_y_range = origin_y_px - y_max_px_coord; // Y axis is inverted in pixels

    const scaleX = logical_x_range !== 0 ? pixel_x_range / logical_x_range : 0;
    const scaleY = logical_y_range !== 0 ? pixel_y_range / logical_y_range : 0;

    const x = ((logicalPoint.logicalX - origin_x_val) * scaleX) + origin_x_px;
    const y = origin_y_px - ((logicalPoint.logicalY - origin_y_val) * scaleY);

    return { x, y };
};
