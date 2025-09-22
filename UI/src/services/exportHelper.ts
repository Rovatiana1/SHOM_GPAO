import { Point, Metadata } from '../types/Image';
import { pixelToLogical } from './geometry';

// This is a simplified client-side reimplementation of the Python backend's interpolation logic.
// For a full-featured version, a more robust interpolation library might be needed.

export const generateCsvContent = (points: Point[], dates: string[], metadata: Metadata, durationMinutes: number): string => {
    if (points.length === 0) return '';
    
    const data = points.map((p, i) => {
        const logical = pixelToLogical(p, metadata);
        return {
            date: dates[i],
            logicalX: logical.logicalX,
            logicalY: logical.logicalY,
        };
    }).sort((a, b) => {
        if (a.date! < b.date!) return -1;
        if (a.date! > b.date!) return 1;
        return a.logicalX - b.logicalX;
    });

    const groupedByDate: { [key: string]: { logicalX: number, logicalY: number }[] } = {};
    data.forEach(d => {
        if (!groupedByDate[d.date!]) {
            groupedByDate[d.date!] = [];
        }
        groupedByDate[d.date].push({ logicalX: d.logicalX, logicalY: d.logicalY });
    });

    let csvRows = ['Année;Mois;Jour;Heure;Minute;Seconde;Hauteur d\'eau (m)'];

    Object.keys(groupedByDate).forEach(dateStr => {
        const datePoints = groupedByDate[dateStr];
        if (datePoints!.length < 2) {
            // Not enough points to interpolate, just export the points we have
            datePoints!.forEach(p => {
                const dt = decimalHourToDate(p.logicalX, dateStr);
                const row = [
                    dt.getFullYear(),
                    (dt.getMonth() + 1).toString().padStart(2, '0'),
                    dt.getDate().toString().padStart(2, '0'),
                    dt.getHours().toString().padStart(2, '0'),
                    dt.getMinutes().toString().padStart(2, '0'),
                    dt.getSeconds().toString().padStart(2, '0'),
                    p.logicalY.toFixed(3).replace('.', ',')
                ].join(';');
                csvRows.push(row);
            });
            return;
        }

        const xVals = datePoints!.map(p => p.logicalX);
        const yVals = datePoints!.map(p => p.logicalY);

        const intervalHours = durationMinutes / 60;
        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);

        let currentX = xMin;
        while (currentX <= xMax) {
            const y = linearInterpolate(currentX, xVals, yVals);
            
            const dt = decimalHourToDate(currentX, dateStr);
            const row = [
                dt.getFullYear(),
                (dt.getMonth() + 1).toString().padStart(2, '0'),
                dt.getDate().toString().padStart(2, '0'),
                dt.getHours().toString().padStart(2, '0'),
                dt.getMinutes().toString().padStart(2, '0'),
                dt.getSeconds().toString().padStart(2, '0'),
                y.toFixed(3).replace('.', ',')
            ].join(';');
            csvRows.push(row);
            
            if (intervalHours === 0) break;
            currentX += intervalHours;
        }
    });

    return csvRows.join('\n');
};

const decimalHourToDate = (decimalHour: number, dateStr: string): Date => {
    const baseDate = new Date(dateStr);
    const hours = Math.floor(decimalHour);
    const minutes = Math.floor((decimalHour - hours) * 60);
    const seconds = Math.round(((decimalHour - hours) * 60 - minutes) * 60);
    baseDate.setUTCHours(hours, minutes, seconds, 0);
    return baseDate;
};


const linearInterpolate = (x: number, xPoints: number[], yPoints: number[]): number => {
    if (x <= xPoints[0]!) return yPoints[0]!;
    if (x >= xPoints[xPoints.length - 1]!) return yPoints[yPoints.length - 1]!;

    let i = 1;
    while (xPoints[i]! < x) {
        i++;
    }

    const x1 = xPoints[i - 1];
    const y1 = yPoints[i - 1];
    const x2 = xPoints[i];
    const y2 = yPoints[i];

    return y1! + ((y2! - y1!) * (x - x1!)) / (x2! - x1!);
};