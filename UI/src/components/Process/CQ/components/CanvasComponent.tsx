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
    addingPoint: boolean;
    tempPoint: { x: number; y: number } | null;
    setTempPoint: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
    cancelAddingPoint: () => void;
    savePoint: (point: { x: number; y: number }) => void;
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
    addPoint,
    addingPoint,
    tempPoint,
    setTempPoint,
    cancelAddingPoint,
    savePoint,
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

    // Dessin de l'image, points, lignes et guides
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

        // Rotation autour du centre
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(viewTransform.angle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Déplacement et zoom
        ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
        ctx.scale(viewTransform.scale, viewTransform.scale);

        ctx.drawImage(image, 0, 0);

        // Dessin des lignes si displayMode === 'line'
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

        // Dessin des points
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

        // Dessin des guides
        if (guides.x !== null || guides.y !== null) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,255,0,0.7)';
            ctx.lineWidth = 3; // <-- ici on augmente l'épaisseur
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
    }, [image, points, dates, viewTransform, displayMode, selectedDate, dateColorMap, uniqueDates, guides]);

    // Gestion des événements
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (addingPoint || tempPoint) return; // Bloquer toute interaction

            e.preventDefault();
            const pos = getMousePos(e);

            // Rotation
            if (e.shiftKey && e.button === 0) {
                setIsRotating(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }

            // Guides
            if (e.altKey && e.button === 0) {
                const rect = canvas.getBoundingClientRect();
                setGuides({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                return;
            }

            // Déplacement de l'image entière
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
            if (addingPoint || tempPoint) return; // Bloquer toute interaction
            const pos = getMousePos(e);

            // Rotation
            if (isRotating && lastMousePos) {
                const dx = e.clientX - lastMousePos.x;
                setViewTransform(prev => ({ ...prev, angle: prev.angle + dx * 0.005 }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }

            // Déplacement de l'image entière
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

            // Déplacement des points
            else if (dragInfo?.isDragging) {
                setPoints(currentPoints =>
                    currentPoints.map((p, i) => (i === dragInfo.index ? { ...p, x: pos.x, y: pos.y } : p))
                );
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            setIsRotating(false);
            setDragInfo(null);
            setLastMousePos(null);
        };

        const handleWheel = (e: WheelEvent) => {
            if (addingPoint || tempPoint) return; // Bloquer toute interaction
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
    }, [getMousePos, findPointIndexAt, addPoint, dragInfo, isPanning, lastMousePos, selectedDate, setDates, setPoints, viewTransform, isRotating, addingPoint, tempPoint]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!addingPoint) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        setTempPoint({ x, y });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Nettoyer
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Dessiner les points existants
        points.forEach(p => {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Dessiner le point temporaire
        if (tempPoint) {
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(tempPoint.x, tempPoint.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }, [points, tempPoint, image]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
            <canvas
                ref={canvasRef}
                width={image.width}
                height={image.height}
                onClick={handleClick}
                className="cursor-crosshair"
                style={{
                    cursor: isRotating
                        ? 'url(/icons/rotate-cursor.png), grab'
                        : isPanning
                            ? 'grabbing'
                            : 'crosshair'
                }}
            />
            <div className="absolute top-2 right-4 text-white text-md bg-black p-2 bg-opacity-50 rounded">
                <div>🔄 Shift + clic gauche = rotation</div>
                <div>🖐 Ctrl/clic milieu = déplacer image</div>
                <div>➕ Alt + clic gauche = guides</div>
            </div>
            {tempPoint && (
                <div
                    className="absolute top-0 left-0"
                    style={{ transform: `translate(${tempPoint.x}px, ${tempPoint.y}px)` }}
                >
                    <div className="bg-white p-2 border rounded shadow-md flex flex-col gap-2">
                        <span>Nouveau repère</span>
                        <div className="flex flex-col gap-1">
                            <label>
                                X:
                                <input
                                    type="number"
                                    value={tempPoint.x}
                                    onChange={e =>
                                        setTempPoint(prev =>
                                            prev ? { ...prev, x: parseFloat(e.target.value) } : null
                                        )
                                    }
                                    className="border px-1 rounded w-20"
                                />
                            </label>
                            <label>
                                Y:
                                <input
                                    type="number"
                                    value={tempPoint.y}
                                    onChange={e =>
                                        setTempPoint(prev =>
                                            prev ? { ...prev, y: parseFloat(e.target.value) } : null
                                        )
                                    }
                                    className="border px-1 rounded w-20"
                                />
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (tempPoint) savePoint(tempPoint);
                                    setTempPoint(null); // ferme le formulaire
                                }}
                                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={() => setTempPoint(null)}
                                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CanvasComponent;
