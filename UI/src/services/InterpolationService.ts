// services/InterpolationService.ts
import { Metadata, Point } from "../types/Image";

interface DataPoint {
  date: Date;
  logical_x: number;
  logical_y: number;
}

export interface InterpolatedRow {
  DateTime: string;
  "Hauteur d'eau (m)": string;
  Année: number;
  Mois: string;
  Jour: string;
  Heure: string;
  Minute: string;
  Seconde: string;
}

/**
 * Converts pixel coordinates to logical coordinates using a full affine transformation.
 * This handles rotated and non-orthogonal axes correctly.
 */
export function pixelToLogical(
  px: number,
  py: number,
  metadata: Metadata
): [number, number] {
    const [origin_px_x, origin_px_y] = metadata.origin_px;
    const [x_max_px_x, x_max_px_y] = metadata.x_max_px;
    const [y_max_px_x, y_max_px_y] = metadata.y_max_px;

    // Vectors for the pixel coordinate system basis
    const vx_px = [x_max_px_x - origin_px_x, x_max_px_y - origin_px_y];
    const vy_px = [y_max_px_x - origin_px_x, y_max_px_y - origin_px_y];

    // Vector from origin to the point in pixel space
    const p_vec_px = [px - origin_px_x, py - origin_px_y];

    // Solve for u and v in p_vec_px = u * vx_px + v * vy_px
    const det = vx_px[0] * vy_px[1] - vx_px[1] * vy_px[0];

    if (Math.abs(det) < 1e-9) { // Using a small epsilon for floating point comparison
        console.warn("⚠️ pixelToLogical: Determinant is zero, axes are collinear.", { vx_px, vy_px });
        return [NaN, NaN];
    }

    const u = (p_vec_px[0] * vy_px[1] - p_vec_px[1] * vy_px[0]) / det;
    const v = (p_vec_px[1] * vx_px[0] - p_vec_px[0] * vx_px[1]) / det;

    // Parse logical values
    let origin_x_value = 0;
    let origin_y_value = 0;
    const origin_value_any = metadata.origin_value as any;
    if (typeof origin_value_any === "string") {
        const match = origin_value_any.match(/\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?/);
        if (match) {
            origin_x_value = parseFloat(match[1]);
            origin_y_value = parseFloat(match[3]);
        }
    } else if (Array.isArray(origin_value_any)) {
        origin_x_value = Number(origin_value_any[0]);
        origin_y_value = Number(origin_value_any[1]);
    }

    const x_max_value = Number(metadata.x_max_value);
    const y_max_value = Number(metadata.y_max_value);

    // Calculate logical coordinates
    const logical_x = origin_x_value + u * (x_max_value - origin_x_value);
    const logical_y = origin_y_value + v * (y_max_value - origin_y_value);

    return [logical_x, logical_y];
}

/**
 * Converts logical coordinates back to pixel coordinates.
 * This is the inverse operation of pixelToLogical and also handles non-orthogonal axes.
 */
export function logicalToPixel(
  logical_x: number,
  logical_y: number,
  metadata: Metadata
): [number, number] {
    // Parse logical values
    let origin_x_value = 0;
    let origin_y_value = 0;
    const origin_value_any = metadata.origin_value as any;
    if (typeof origin_value_any === "string") {
        const match = origin_value_any.match(/\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?/);
        if (match) {
            origin_x_value = parseFloat(match[1]);
            origin_y_value = parseFloat(match[3]);
        }
    } else if (Array.isArray(origin_value_any)) {
        origin_x_value = Number(origin_value_any[0]);
        origin_y_value = Number(origin_value_any[1]);
    }

    const x_max_value = Number(metadata.x_max_value);
    const y_max_value = Number(metadata.y_max_value);

    // Calculate u and v ratios
    const delta_x_val = x_max_value - origin_x_value;
    const delta_y_val = y_max_value - origin_y_value;

    if (Math.abs(delta_x_val) < 1e-9 || Math.abs(delta_y_val) < 1e-9) {
        console.warn("⚠️ logicalToPixel: Logical value range is zero.", { delta_x_val, delta_y_val });
        return [NaN, NaN];
    }
    
    const u = (logical_x - origin_x_value) / delta_x_val;
    const v = (logical_y - origin_y_value) / delta_y_val;

    // Pixel vectors
    const [origin_px_x, origin_px_y] = metadata.origin_px;
    const [x_max_px_x, x_max_px_y] = metadata.x_max_px;
    const [y_max_px_x, y_max_px_y] = metadata.y_max_px;

    const vx_px = [x_max_px_x - origin_px_x, x_max_px_y - origin_px_y];
    const vy_px = [y_max_px_x - origin_px_x, y_max_px_y - origin_px_y];

    // Calculate pixel coordinates
    const px = origin_px_x + u * vx_px[0] + v * vy_px[0];
    const py = origin_px_y + u * vx_px[1] + v * vy_px[1];

    return [px, py];
}


export function linearInterpolate(
  x_known: number[],
  y_known: number[],
  x_new: number
): number {
  if (x_known.length < 2) {
    return y_known[0] ?? 0;
  }

  // Extrapolate before first point
  if (x_new < x_known[0]!) {
    const x1 = x_known[0]!,
      y1 = y_known[0]!;
    const x2 = x_known[1]!,
      y2 = y_known[1]!;
    return y1 + ((x_new - x1) * (y2 - y1)) / (x2 - x1);
  }

  for (let i = 0; i < x_known.length - 1; i++) {
    const x1 = x_known[i]!;
    const y1 = y_known[i]!;
    const x2 = x_known[i + 1]!;
    const y2 = y_known[i + 1]!;

    if (x_new >= x1 && x_new <= x2) {
      return y1 + ((x_new - x1) * (y2 - y1)) / (x2 - x1);
    }
  }

  // Extrapolate after last point
  const x1 = x_known[x_known.length - 2]!;
  const y1 = y_known[y_known.length - 2]!;
  const x2 = x_known[x_known.length - 1]!;
  const y2 = y_known[y_known.length - 1]!;
  return y1 + ((x_new - x1) * (y2 - y1)) / (x2 - x1);
}

export function generatePreviewData(
  points: Point[],
  dates: string[],
  duration: number,
  metadata: Metadata
): InterpolatedRow[] {
  // 1️⃣ Conversion en coordonnées logiques
  let df: DataPoint[] = points
    .map((p, i) => {
      const [logical_x, logical_y] = pixelToLogical(p.x, p.y, metadata);
      console.log(`Point ${i}: pixel (${p.x}, ${p.y}) -> logical (${logical_x}, ${logical_y})`);
      return {
        date: new Date(dates[i]!),
        logical_x,
        logical_y,
      };
    })
    .filter((p) => !isNaN(p.logical_x) && !isNaN(p.logical_y));

  // 2️⃣ Récupération des bornes X avec parsing correct
  let origin_x_val = 0;
  let origin_y_val = 0;

  // FIX: Property 'match' does not exist on type 'never'. Cast to 'any' to allow type-checking logic to proceed as intended.
  const origin_value_any = metadata.origin_value as any;
  if (typeof origin_value_any === "string") {
    const match = origin_value_any.match(/\(?\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*\)?/);
    if (match) {
      origin_x_val = parseFloat(match[1]);
      origin_y_val = parseFloat(match[3]);
    } else {
      console.warn("⚠️ generatePreviewData: format invalide pour origin_value", origin_value_any);
    }
  } else if (Array.isArray(origin_value_any)) {
    origin_x_val = Number(origin_value_any[0]);
    origin_y_val = Number(origin_value_any[1]);
  }

  const x_max_val = Number(metadata.x_max_value);
  const x_min_bound = Math.min(origin_x_val, x_max_val);
  const x_max_bound = Math.max(origin_x_val, x_max_val);

  console.log(`Filtering points with logical X between ${x_min_bound} and ${x_max_bound}`);

  // 3️⃣ Filtrage selon bornes
  df = df.filter(
    (p) => p.logical_x >= x_min_bound && p.logical_x <= x_max_bound
  );

  console.log(`Filtered to ${df.length} points within logical X bounds.`);
  if (df.length === 0) {
    throw new Error("Aucun point après filtrage.");
  }

  // 4️⃣ Arrondi
  df = df.map((p) => ({
    ...p,
    logical_x: parseFloat(p.logical_x.toFixed(4)),
    logical_y: parseFloat(p.logical_y.toFixed(4)),
  }));

  // 5️⃣ Suppression des doublons
  const seen = new Set<string>();
  df = df.filter((item) => {
    const key = `${item.date.toISOString()}|${item.logical_x}|${item.logical_y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 6️⃣ Tri
  df.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.logical_x - b.logical_x;
  });

  if (df.length === 0) {
    throw new Error("Aucun point valide n'a été trouvé pour générer un aperçu.");
  }

  // 7️⃣ Groupement et interpolation
  const interval_hours = duration / 60;
  const all_export_rows: InterpolatedRow[] = [];

  const groups = new Map<string, DataPoint[]>();
  df.forEach((p) => {
    const dateStr = p.date.toISOString().split("T")[0]!;
    if (!groups.has(dateStr)) groups.set(dateStr, []);
    groups.get(dateStr)!.push(p);
  });

  for (const [dateStr, group] of groups.entries()) {
    const x_vals = group.map((p) => p.logical_x);
    const y_vals = group.map((p) => p.logical_y);

    const epsilon = 1e-6;
    const first_x = Math.min(...x_vals);
    const end_x = Math.max(...x_vals);

    const x_grid_set = new Set<number>();
    x_grid_set.add(first_x);
    let next_point = interval_hours
      ? Math.ceil(first_x / interval_hours) * interval_hours
      : first_x;
    while (next_point < end_x - epsilon) {
      x_grid_set.add(next_point);
      next_point += interval_hours;
    }
    if (Math.abs(end_x - (Array.from(x_grid_set).pop() ?? 0)) > epsilon) {
      x_grid_set.add(end_x);
    }

    const x_grid = Array.from(x_grid_set)
      .map((v) => parseFloat(v.toFixed(6)))
      .sort((a, b) => a - b);

    // ✅ Interpolation linéaire
    const uniquePoints = new Map<number, number>();
    group.forEach((p) => uniquePoints.set(p.logical_x, p.logical_y));
    const x_unique = Array.from(uniquePoints.keys()).sort((a, b) => a - b);
    const y_unique = x_unique.map((x) => uniquePoints.get(x)!);

    if (x_unique.length < 1) continue;

    const y_grid = x_grid.map((x) => linearInterpolate(x_unique, y_unique, x));

    const currentDate = new Date(dateStr + "T00:00:00Z");

    for (let i = 0; i < x_grid.length; i++) {
      const dec_hour = x_grid[i]!;
      const hours = Math.floor(dec_hour);
      const minutes_rem = (dec_hour - hours) * 60;
      const minutes = Math.floor(minutes_rem);
      const seconds = Math.round((minutes_rem - minutes) * 60);
      const dt = new Date(currentDate);
      dt.setUTCHours(hours, minutes, seconds, 0);

      const pad = (n: number) => n.toString().padStart(2, "0");

      all_export_rows.push({
        DateTime: dt.toISOString(),
        "Hauteur d'eau (m)": parseFloat(y_grid[i]!.toFixed(2)).toLocaleString(
          "fr-FR",
          { minimumFractionDigits: 2 }
        ),
        Année: dt.getUTCFullYear(),
        Mois: pad(dt.getUTCMonth() + 1),
        Jour: pad(dt.getUTCDate()),
        Heure: pad(dt.getUTCHours()),
        Minute: pad(dt.getUTCMinutes()),
        Seconde: pad(dt.getUTCSeconds()),
      });
    }
  }

  // 8️⃣ Suppression finale des doublons
  const finalSeen = new Set<string>();
  return all_export_rows.filter((row) => {
    const key = `${row.Année}-${row.Mois}-${row.Jour} ${row.Heure}:${row.Minute}:${row.Seconde}|${row["Hauteur d'eau (m)"]}`;
    if (finalSeen.has(key)) return false;
    finalSeen.add(key);
    return true;
  });
}