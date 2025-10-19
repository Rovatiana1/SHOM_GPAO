
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DateInfo, DisplayMode, Metadata, Point, ReperePoint } from '../../../../types/Image';

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
    addingPoint: boolean;
    setAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
    tempPoint: { x: number; y: number } | null;
    setTempPoint: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
    cancelAddingPoint: () => void;
    savePoint: (point: { x: number; y: number }) => void;
    currentPointIndex?: number | null;
}

const POINT_RADIUS = 5;
const HOVER_RADIUS = 15;
const VALIDATION_ZOOM_SCALE = 5;

// // Conversion cm → px (en supposant 96 dpi = 37.8 px/cm)
const CM_TO_PX = 37.8;
const VALIDATION_DIAMETER_CM = 3;
const VALIDATION_RADIUS_PX = (VALIDATION_DIAMETER_CM * CM_TO_PX) / 2; // ≈ 56.7px
// const VALIDATION_RADIUS_PX = (VALIDATION_DIAMETER_CM * CM_TO_PX) / 3; // ≈ 56.7px

// // Conversion cm -> px (300 dpi)
// const DPI = 300;
// const CM_TO_PX = DPI / 2.54; // ≈ 118.11 px/cm
// const VALIDATION_DIAMETER_CM = 3;
// const VALIDATION_RADIUS_PX = (VALIDATION_DIAMETER_CM * CM_TO_PX) / 2; // ≈ 177.16 px


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
    addPoint,
    addingPoint,
    setAddingPoint,
    tempPoint,
    setTempPoint,
    cancelAddingPoint,
    savePoint,
    currentPointIndex,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewTransform, setViewTransform] = useState({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        angle: 0
    });
    const [dragInfo, setDragInfo] = useState<{ index: number; isDragging: boolean } | null>(null);
    const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
    const isValidationMode = currentPointIndex != null;

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
        if (isValidationMode) return -1;
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
    }, [points, dates, selectedDate, viewTransform.scale, isValidationMode]);

    // Auto-zoom to current point in validation mode
    useEffect(() => {
        const canvas = canvasRef.current;
        const point = (currentPointIndex != null) ? points[currentPointIndex] : null;

        if (isValidationMode && point && canvas) {
            const newOffsetX = (canvas.width / 2) - (point.x * VALIDATION_ZOOM_SCALE);
            const newOffsetY = (canvas.height / 2) - (point.y * VALIDATION_ZOOM_SCALE);

            setViewTransform(prev => ({ ...prev, scale: VALIDATION_ZOOM_SCALE, offsetX: newOffsetX, offsetY: newOffsetY }));
        }
    }, [currentPointIndex, points, image, isValidationMode]);


    // Drawing effect
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const parent = canvas.parentElement;
        if (parent) {
            const { clientWidth: pw, clientHeight: ph } = parent;
            canvas.width = pw;
            canvas.height = ph;

            // Only set initial scale if not in validation mode and not already transformed
            if (!isValidationMode && viewTransform.scale === 1 && viewTransform.offsetX === 0 && viewTransform.offsetY === 0) {
                const initialScale = Math.min(canvas.width / image.width, canvas.height / image.height);
                setViewTransform(prev => ({
                    ...prev,
                    scale: initialScale,
                    offsetX: (canvas.width - image.width * initialScale) / 2,
                    offsetY: (canvas.height - image.height * initialScale) / 2
                }));
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Rotation autour du centre
        // ctx.translate(canvas.width / 2, canvas.height / 2);
        // ctx.rotate(viewTransform.angle);
        // ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Déplacement et zoom
        ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
        ctx.scale(viewTransform.scale, viewTransform.scale);

        ctx.drawImage(image, 0, 0);

        const parseCoords = (coord: ReperePoint): [number, number] => {
            const match = String(coord).match(/\(?\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*\)?/);
            if (!match) return [0, 0];
            return [parseFloat(match[1]!), parseFloat(match[2]!)];
        };

        if (metadata) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2 / viewTransform.scale;
            const [ox, oy] = parseCoords(metadata.origin_px!);
            const [xmax,] = parseCoords(metadata.x_max_px!);
            const [, ymax] = parseCoords(metadata.y_max_px);
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(xmax, oy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox, ymax);
            ctx.stroke();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ox, oy, 6 / viewTransform.scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = `${14 / viewTransform.scale}px Arial`;
            ctx.fillText("O", ox + 8 / viewTransform.scale, oy - 8 / viewTransform.scale);
        }

        const sqrtScale = Math.sqrt(viewTransform.scale);

        if (displayMode === 'line') {
            uniqueDates.forEach(({ date, color }) => {
                if (selectedDate && date !== selectedDate) return;
                const datePoints = points.map((p, i) => ({ ...p, date: dates[i] })).filter(p => p.date === date).sort((a, b) => a.x - b.x);
                if (datePoints.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(datePoints[0]!.x, datePoints[0]!.y);
                    datePoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2 / sqrtScale;
                    ctx.stroke();
                }
            });
        }

        points.forEach((point, i) => {
            if (!isValidationMode && selectedDate && dates[i] !== selectedDate) return;

            let color;
            switch (point.validationStatus) {
                case 'valid': color = '#22c55e'; break; // green-500
                case 'error': color = '#ef4444'; break; // red-500
                case 'pending':
                default: color = dateColorMap.get(dates[i]!) || '#ff0000';
            }

            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 / sqrtScale;

            if (displayMode === 'points' || displayMode === 'line') {
                ctx.beginPath();
                ctx.arc(point.x, point.y, POINT_RADIUS / sqrtScale, 0, 2 * Math.PI);
                ctx.fill();
            } else if (displayMode === 'cross') {
                const crossSize = (POINT_RADIUS * 1.5) / sqrtScale;
                ctx.beginPath();
                ctx.moveTo(point.x - crossSize, point.y - crossSize);
                ctx.lineTo(point.x + crossSize, point.y + crossSize);
                ctx.moveTo(point.x + crossSize, point.y - crossSize);
                ctx.lineTo(point.x - crossSize, point.y + crossSize);
                ctx.stroke();
            }

            // if (isValidationMode && i === currentPointIndex) {
            //     ctx.strokeStyle = '#0ea5e9'; // sky-500
            //     ctx.lineWidth = 2 / sqrtScale;
            //     ctx.beginPath();
            //     ctx.arc(point.x, point.y, HOVER_RADIUS / sqrtScale, 0, 2 * Math.PI);
            //     ctx.stroke();
            // }
            if (isValidationMode && i === currentPointIndex) {
                ctx.strokeStyle = '#0ea5e9'; // sky-500
                ctx.lineWidth = 2 / sqrtScale;
                ctx.beginPath();
                ctx.arc(point.x, point.y, VALIDATION_RADIUS_PX / sqrtScale, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });

        ctx.restore();

        if (guides.x !== null || guides.y !== null) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,255,0,0.7)';
            ctx.lineWidth = 3;
            if (guides.x !== null) {
                ctx.beginPath();
                ctx.moveTo(guides.x, 0);
                ctx.lineTo(guides.x, canvas.height);
                ctx.stroke();
            }
            if (guides.y !== null) {
                ctx.beginPath();
                ctx.moveTo(0, guides.y);
                ctx.lineTo(canvas.width, guides.y);
                ctx.stroke();
            }
            ctx.restore();
        }
    }, [image, points, dates, viewTransform, displayMode, selectedDate, dateColorMap, uniqueDates, guides, metadata, currentPointIndex, isValidationMode]);

    // Event handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            if (isValidationMode) { e.preventDefault(); return; }
            if (addingPoint) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - viewTransform.offsetX) / viewTransform.scale;
                const y = (e.clientY - rect.top - viewTransform.offsetY) / viewTransform.scale;
                setTempPoint({ x, y });
                return;
            }

            e.preventDefault();
            const pos = getMousePos(e);

            // Rotation
            // if (e.shiftKey && e.button === 0) {
            //     setIsRotating(true);
            //     setLastMousePos({ x: e.clientX, y: e.clientY });
            //     return;
            // }

            if (e.altKey && e.button === 0) {
                const rect = canvas.getBoundingClientRect();
                setGuides({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                return;
            }
            if (e.button === 1 || e.ctrlKey) {
                setIsPanning(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }

            const pointIndex = findPointIndexAt(pos);
            if (e.button === 0) {
                if (pointIndex !== -1) {
                    setDragInfo({ index: pointIndex, isDragging: true });
                } else if (selectedDate) {
                    addPoint(pos);
                }
            } else if (e.button === 2 && pointIndex !== -1) {
                setPoints(prev => prev.filter((_, i) => i !== pointIndex));
                setDates(prev => prev.filter((_, i) => i !== pointIndex));
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isValidationMode || addingPoint) return;
            const pos = getMousePos(e);

            if (isRotating && lastMousePos) {
                const dx = e.clientX - lastMousePos.x;
                setViewTransform(prev => ({ ...prev, angle: prev.angle + dx * 0.005 }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }
            if (isPanning && lastMousePos) {
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                setViewTransform(prev => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
            } else if (dragInfo?.isDragging) {
                setPoints(currentPoints => currentPoints.map((p, i) => (i === dragInfo.index ? { ...p, x: pos.x, y: pos.y } : p)));
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            setIsRotating(false);
            setDragInfo(null);
            setLastMousePos(null);
        };

        const handleWheel = (e: WheelEvent) => {
            if (isValidationMode || addingPoint) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const zoomFactor = 1.1;
            const scale = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
            const newScale = viewTransform.scale * scale;
            if (newScale < 0.1 || newScale > 20) return;
            const newOffsetX = mouseX - (mouseX - viewTransform.offsetX) * scale;
            const newOffsetY = mouseY - (mouseY - viewTransform.offsetY) * scale;
            setViewTransform(prev => ({ ...prev, scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY }));
        };

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('contextmenu', handleContextMenu);
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [getMousePos, findPointIndexAt, addPoint, dragInfo, isPanning, lastMousePos, selectedDate, setDates, setPoints, viewTransform, isRotating, addingPoint, isValidationMode]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!addingPoint) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setTempPoint({ x, y });
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
            <canvas
                ref={canvasRef}
                width={image.width}
                height={image.height}
                onClick={handleClick}
                style={{
                    cursor: isValidationMode
                        ? 'default'
                        : (isRotating ? 'grabbing' : (isPanning ? 'grabbing' : 'crosshair'))
                }}
            />
            {!isValidationMode && (
                <div className="absolute top-2 right-4 text-white text-md bg-black p-2 bg-opacity-50 rounded">
                    {/* <div>🔄 Shift + clic gauche = rotation</div> */}
                    <div>🖐 Ctrl/clic milieu = déplacer image</div>
                    <div>➕ Alt + clic gauche = guides</div>
                </div>
            )}
            {tempPoint && (
                <div
                    className="absolute"
                    style={{
                        left: `${tempPoint.x}px`,
                        top: `${tempPoint.y}px`,
                    }}
                >
                    <div className="bg-white p-2 border rounded shadow-md flex flex-col gap-2">
                        <span>Nouveau repère</span>
                        {/* Input fields and buttons... */}
                    </div>
                </div>
            )}
            {addingPoint && !isValidationMode && (
                <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none"></div>
            )}
        </div>
    );
};

export default CanvasComponent;