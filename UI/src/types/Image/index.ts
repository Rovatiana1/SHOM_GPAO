export interface Point {
  x: number;
  y: number;
  logicalX: number;
  logicalY: number;
  validationStatus?: "pending" | "valid" | "error";
}

export type ReperePoint = [number, number];

export interface Metadata {
  origin_px: ReperePoint;
  origin_value: ReperePoint;
  x_max_px: ReperePoint;
  y_max_px: ReperePoint;
  y_max_value: number;
  x_max_value: number;
  Img_path: string; // This will just be the filename
}

export type DisplayMode = "points" | "cross" | "line";

export interface DateInfo {
  date: string;
  color: string;
}

// export interface Capture {
//   imageData: string;
//   type: string;
//   nature: string;
//   filename: string;
// }



export interface Capture {
  id?: number;
  imageData: string;
  type: string;
  nature: string;
  filename: string;
  isNew?: boolean;
  isArchived?: boolean;
  status?: "pending" | "valid" | "rejected";
  rejectionReason?: string;
  imageCorrespondante?: string;
}


export interface CaptureReviewItem extends Capture {
  id: number;
  status: "pending" | "valid" | "rejected";
  rejectionReason?: string;
  imageCorrespondante: string;
  imageData: string;
  type: string;
  nature: string;
  filename: string;
}
