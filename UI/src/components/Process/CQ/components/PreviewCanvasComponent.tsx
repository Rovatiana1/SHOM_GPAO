import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DateInfo, DisplayMode, Metadata } from '../../../../types/Image';
import { InterpolatedRow, logicalToPixel } from '../../../../services/InterpolationService';
import { XCircle } from 'lucide-react';
import Icons from './Icons';

interface PreviewCanvasProps {
    image: HTMLImageElement;
    previewData: InterpolatedRow[];
    uniqueDates: DateInfo[];
    selectedDate: string | null;
    metadata: Metadata;
    onExit: () => void;
    displayMode: DisplayMode;
}

const POINT_RADIUS = 5; // Preview points are smaller for clarity

const PreviewCanvasComponent: React.FC<PreviewCanvasProps> = ({
    image,
    previewData,
    uniqueDates,
    selectedDate,
    metadata,
    onExit,
    displayMode,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [viewTransform, setViewTransform] = useState({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        angle: 0
    });
    
    const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

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

    const pointsToDraw = React.useMemo(() => {
        return previewData.map(row => {
            const dateStr = `${row.Année}-${row.Mois}-${row.Jour}`;
            
            const logical_x = parseFloat(row.Heure) + parseFloat(row.Minute) / 60 + parseFloat(row.Seconde) / 3600;
            const logical_y = parseFloat(row["Hauteur d'eau (m)"].replace(',', '.'));
            
            if (isNaN(logical_x) || isNaN(logical_y)) return null;

            const [px, py] = logicalToPixel(logical_x, logical_y, metadata);
            
            if (isNaN(px) || isNaN(py)) return null;
            
            return { x: px, y: py, date: dateStr };
        }).filter((p): p is { x: number; y: number; date: string } => p !== null);
    }, [previewData, metadata]);


    // Main drawing effect
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const parent = canvas.parentElement;
        if (parent) {
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

            if (viewTransform.scale === 1 && viewTransform.offsetX === 0 && viewTransform.offsetY === 0) {
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
        ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
        ctx.scale(viewTransform.scale, viewTransform.scale);
        ctx.drawImage(image, 0, 0);

        const sqrtScale = Math.sqrt(viewTransform.scale);

        if (metadata) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2 / sqrtScale;

            const [ox, oy] = metadata.origin_px;
            const [xmax, xmax_y] = metadata.x_max_px;
            const [ymax_x, ymax] = metadata.y_max_px;

            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(xmax, xmax_y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ymax_x, ymax);
            ctx.stroke();

            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ox, oy, 6 / sqrtScale, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.font = `${14 / sqrtScale}px Arial`;
            ctx.fillText("O", ox + 8 / sqrtScale, oy - 8 / sqrtScale);
        }
        
        if (displayMode === 'line') {
            uniqueDates.forEach(({ date, color }) => {
                if (selectedDate && date !== selectedDate) return;

                const datePoints = pointsToDraw
                    .filter(p => p.date === date)
                    .sort((a, b) => a.x - b.x);

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

        pointsToDraw.forEach((point) => {
            if (selectedDate && point.date !== selectedDate) return;
            const color = dateColorMap.get(point.date) || '#ff00ff';
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
    }, [image, pointsToDraw, viewTransform, displayMode, selectedDate, dateColorMap, uniqueDates, guides, metadata]);

    // Event handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            const pos = getMousePos(e);

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
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isPanning && lastMousePos) {
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                setViewTransform(prev => ({
                    ...prev,
                    offsetX: prev.offsetX + dx,
                    offsetY: prev.offsetY + dy
                }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            setLastMousePos(null);
        };

        const handleWheel = (e: WheelEvent) => {
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
    }, [getMousePos, isPanning, lastMousePos, viewTransform]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
            <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Icons.Eye />
                <span className="ml-3 font-bold text-lg">Mode Prévisualisation</span>
                <button 
                    onClick={onExit}
                    className="ml-auto flex items-center gap-2 px-4 py-1 bg-white text-indigo-600 rounded-md hover:bg-indigo-100 font-semibold transition-colors"
                >
                    <XCircle size={18} />
                    Quitter
                </button>
            </div>
            <canvas
                ref={canvasRef}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            />
            <div className="absolute top-20 right-4 text-white text-md bg-black p-2 bg-opacity-50 rounded">
                <div>🖐 Ctrl/clic milieu = déplacer image</div>
                <div>➕ Alt + clic gauche = guides</div>
            </div>
        </div>
    );
};

export default PreviewCanvasComponent;