
import { Point, Metadata, DateInfo } from '../types';

const BASE_COLORS = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
    "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
    "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
    "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];

const parseCoordString = <T,>(str: string): T => {
    try {
        const cleaned = str.replace(/[()\[\]]/g, '');
        const parts = cleaned.split(',').map(s => parseFloat(s.trim()));
        if (parts.length !== 2 || parts.some(isNaN)) {
            throw new Error();
        }
        return parts as T;
    } catch (e) {
        throw new Error(`Invalid coordinate string format: "${str}"`);
    }
};


export const parseCsv = (file: File): Promise<{ points: Point[], metadata: Metadata, dates: string[], uniqueDates: DateInfo[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/);

            const rawMetadata: { [key: string]: string } = {};
            let headerIndex = -1;

            lines.forEach((line, index) => {
                if (line.trim().startsWith('#')) {
                    const [key, ...valueParts] = line.substring(1).split(':');
                    if (key && valueParts.length > 0) {
                        rawMetadata[key.trim()] = valueParts.join(':').trim();
                    }
                } else if (line.includes('Année') && headerIndex === -1) {
                    headerIndex = index;
                }
            });

            if (headerIndex === -1) {
                return reject(new Error('CSV header row (containing "Année") not found.'));
            }

            try {
                const metadata: Metadata = {
                    origin_px: parseCoordString(rawMetadata.origin_px),
                    origin_value: parseCoordString(rawMetadata.origin_value),
                    x_max_px: parseCoordString(rawMetadata.x_max_px),
                    y_max_px: parseCoordString(rawMetadata.y_max_px),
                    x_max_value: parseFloat(rawMetadata.x_max_value),
                    y_max_value: parseFloat(rawMetadata.y_max_value),
                    Img_path: rawMetadata.Img_path,
                };

                const header = lines[headerIndex].split(';').map(h => h.trim());
                const dataLines = lines.slice(headerIndex + 1);
                
                const points: Point[] = [];
                const dates: string[] = [];
                const dateSet = new Set<string>();

                dataLines.forEach(line => {
                    if(line.trim() === '') return;
                    const values = line.split(';');
                    const row: { [key: string]: string } = {};
                    header.forEach((h, i) => {
                        row[h] = values[i];
                    });

                    const year = parseInt(row['Année'], 10);
                    const month = parseInt(row['Mois'], 10);
                    const day = parseInt(row['Jour'], 10);
                    const hour = parseInt(row['Heure'], 10);
                    const minute = parseInt(row['Minute'], 10);
                    const height = parseFloat(row["Hauteur d'eau (m)"].replace(',', '.'));

                    if ([year, month, day, hour, minute, height].some(isNaN)) {
                       console.warn(`Skipping invalid row: ${line}`);
                       return;
                    }
                    
                    const dateStr = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    dateSet.add(dateStr);
                    dates.push(dateStr);

                    const decimalHour = hour + minute / 60.0;
                    
                    points.push({
                        x: 0, // Placeholder, will be calculated in App.tsx
                        y: 0, // Placeholder, will be calculated in App.tsx
                        logicalX: decimalHour,
                        logicalY: height
                    });
                });
                
                const uniqueDatesArray = Array.from(dateSet).sort();
                const uniqueDates: DateInfo[] = uniqueDatesArray.map((date, index) => ({
                    date,
                    color: BASE_COLORS[index % BASE_COLORS.length],
                }));

                resolve({ points, metadata, dates, uniqueDates });

            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
