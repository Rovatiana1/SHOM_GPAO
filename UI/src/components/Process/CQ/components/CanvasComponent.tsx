
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DateInfo, DisplayMode, Metadata, Point } from '../../../../types/Image';

interface CanvasProps {
    image: HTMLImageElement;
    points: Point[];
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
    dates: string[];
    setDates: React.Dispatch<React.SetStateAction<string[]>>;
    uniqueDates: DateInfo[];
    selectedDate: string | null;
    displayMode: DisplayMode;
    metadata: Metadata | null;
    setMetadata: React.Dispatch<React.SetStateAction<Metadata | null>>;
    addPoint: (point: { x: number, y: number }) => void;
}

const POINT_RADIUS = 5;
const HOVER_RADIUS = 8;

const CanvasComponent: React.FC<CanvasProps> = ({
    image,
    points,
    setPoints,
    dates,
    setDates,
    uniqueDates,
    selectedDate,
    displayMode,
    metadata,
    addPoint
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewTransform, setViewTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
    const [dragInfo, setDragInfo] = useState<{ index: number; isDragging: boolean } | null>(null);
    const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);

    const dateColorMap = React.useMemo(() => {
        const map = new Map<string, string>();
        uniqueDates.forEach(d => map.set(d.date, d.color));
        return map;
    }, [uniqueDates]);

    const getMousePos = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const inverseScale = 1 / viewTransform.scale;
        const x = (e.clientX - rect.left - viewTransform.offsetX) * inverseScale;
        const y = (e.clientY - rect.top - viewTransform.offsetY) * inverseScale;
        return { x, y };
    }, [viewTransform]);

    const findPointIndexAt = useCallback((pos: { x: number, y: number }) => {
        const tolerance = HOVER_RADIUS / viewTransform.scale;
        for (let i = points.length - 1; i >= 0; i--) {
            const point = points[i];
            const date = dates[i];
            if (selectedDate && date !== selectedDate) continue;

            const dx = pos.x - point!.x;
            const dy = pos.y - point!.y;
            if (Math.sqrt(dx * dx + dy * dy) <= tolerance) {
                return i;
            }
        }
        return -1;
    }, [points, dates, selectedDate, viewTransform.scale]);

    // Drawing Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // Set canvas size to fit parent while maintaining aspect ratio
        const parent = canvas.parentElement;
        if(parent) {
            const { clientWidth: pw, clientHeight: ph } = parent;
            const imgRatio = image.width / image.height;
            const parentRatio = pw / ph;
            let canvasWidth, canvasHeight;
            if (imgRatio > parentRatio) {
                canvasWidth = pw;
                canvasHeight = pw / imgRatio;
            } else {
                canvasHeight = ph;
                canvasWidth = ph * imgRatio;
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Recalculate initial scale to fit image
            if (viewTransform.scale === 1 && viewTransform.offsetX === 0 && viewTransform.offsetY === 0) {
                 const initialScale = Math.min(canvas.width / image.width, canvas.height / image.height);
                 setViewTransform({scale: initialScale, offsetX: (canvas.width - image.width * initialScale) / 2, offsetY: (canvas.height - image.height * initialScale) / 2});
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
        ctx.scale(viewTransform.scale, viewTransform.scale);
        
        ctx.drawImage(image, 0, 0);

        const filteredPoints = selectedDate ? points.filter((_, i) => dates[i] === selectedDate) : points;
        
        // Draw lines first if in line mode
        if (displayMode === 'line') {
             uniqueDates.forEach(({ date, color }) => {
                if (selectedDate && date !== selectedDate) return;
                
                const datePoints = points
                    .map((p, i) => ({ ...p, date: dates[i] }))
                    .filter(p => p.date === date)
                    .sort((a, b) => a.x - b.x);

                if (datePoints.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(datePoints[0]!.x, datePoints[0]!.y);
                    datePoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2 / viewTransform.scale;
                    ctx.stroke();
                }
            });
        }
        
        // Draw points
        points.forEach((point, i) => {
            if (selectedDate && dates[i] !== selectedDate) return;
            const color = dateColorMap.get(dates[i]!) || '#ff0000';
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 / viewTransform.scale;
            
            if (displayMode === 'points' || displayMode === 'line') {
                ctx.beginPath();
                ctx.arc(point.x, point.y, POINT_RADIUS / viewTransform.scale, 0, 2 * Math.PI);
                ctx.fill();
            } else if (displayMode === 'cross') {
                const crossSize = (POINT_RADIUS * 1.5) / viewTransform.scale;
                ctx.beginPath();
                ctx.moveTo(point.x - crossSize, point.y - crossSize);
                ctx.lineTo(point.x + crossSize, point.y + crossSize);
                ctx.moveTo(point.x + crossSize, point.y - crossSize);
                ctx.lineTo(point.x - crossSize, point.y + crossSize);
                ctx.stroke();
            }
        });

        ctx.restore();
    }, [image, points, dates, viewTransform, displayMode, selectedDate, dateColorMap]);

    // Event Listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            const pos = getMousePos(e);
            
            if (e.button === 1 || e.ctrlKey) { // Middle mouse or Ctrl+Click for panning
                setIsPanning(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }

            const pointIndex = findPointIndexAt(pos);

            if (e.button === 0) { // Left click
                if (pointIndex !== -1) {
                    setDragInfo({ index: pointIndex, isDragging: true });
                } else if (selectedDate) {
                    addPoint(pos);
                }
            } else if (e.button === 2) { // Right click
                 if (pointIndex !== -1) {
                    setPoints(prev => prev.filter((_, i) => i !== pointIndex));
                    setDates(prev => prev.filter((_, i) => i !== pointIndex));
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (isPanning && lastMousePos) {
                 const dx = e.clientX - lastMousePos.x;
                 const dy = e.clientY - lastMousePos.y;
                 setViewTransform(prev => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
                 setLastMousePos({ x: e.clientX, y: e.clientY });
            } else if (dragInfo?.isDragging) {
                setPoints(currentPoints =>
                    currentPoints.map((p, i) => (i === dragInfo.index ? { ...p, x: pos.x, y: pos.y } : p))
                );
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            setDragInfo(null);
            setLastMousePos(null);
        };
        
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomFactor = 1.1;
            const scale = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
            
            const newScale = viewTransform.scale * scale;
            if (newScale < 0.1 || newScale > 20) return;

            const newOffsetX = mouseX - (mouseX - viewTransform.offsetX) * scale;
            const newOffsetY = mouseY - (mouseY - viewTransform.offsetY) * scale;
            
            setViewTransform({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
        };
        
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [getMousePos, findPointIndexAt, addPoint, dragInfo, isPanning, lastMousePos, selectedDate, setDates, setPoints, viewTransform]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <canvas ref={canvasRef} className="cursor-crosshair" />
        </div>
    );
};

export default CanvasComponent;
