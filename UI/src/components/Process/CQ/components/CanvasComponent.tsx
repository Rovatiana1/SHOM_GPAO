import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DateInfo, DisplayMode, Metadata, Point, ReperePoint } from '../../../../types/Image';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

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
    isSettingOrigin: boolean;
    setIsSettingOrigin: React.Dispatch<React.SetStateAction<boolean>>;
    saveNewOrigin: (repere: { origin: Point; xAxis: Point; yAxis: Point }) => void;
}

const POINT_RADIUS = 7;
const HOVER_RADIUS = 15;
const VALIDATION_ZOOM_SCALE = 20;

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
    isSettingOrigin,
    setIsSettingOrigin,
    saveNewOrigin
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
    
    const [repereStep, setRepereStep] = useState<number>(0); // 0: idle, 1: set origin, 2: set x-axis, 3: set y-axis, 4: confirm
    const [tempRepere, setTempRepere] = useState<{ origin: Point | null; xAxis: Point | null; yAxis: Point | null }>({
        origin: null,
        xAxis: null,
        yAxis: null,
    });
    const [repereMousePos, setRepereMousePos] = useState<{ x: number; y: number } | null>(null);


    useEffect(() => {
        if (isSettingOrigin) {
            setRepereStep(1);
        } else {
            setRepereStep(0);
            setTempRepere({ origin: null, xAxis: null, yAxis: null });
            setRepereMousePos(null);
        }
    }, [isSettingOrigin]);

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

            if (!addingPoint && viewTransform.scale === 1 && viewTransform.offsetX === 0 && viewTransform.offsetY === 0) {
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

        const sqrtScale = Math.sqrt(viewTransform.scale);

        // --- Dessin du repère si metadata existe ---
        if (metadata) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2 / sqrtScale;

            const [ox, oy] = metadata.origin_px;
            const [xmax, xmax_y] = metadata.x_max_px;
            const [ymax_x, ymax] = metadata.y_max_px;

            // Axe X
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(xmax, xmax_y); // Use full coordinate for potentially rotated axes
            ctx.stroke();

            // Axe Y
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ymax_x, ymax); // Use full coordinate for potentially rotated axes
            ctx.stroke();

            // Origine
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ox, oy, 6 / sqrtScale, 0, 2 * Math.PI);
            ctx.fill();

            // Optionnel : texte "O"
            ctx.fillStyle = "black";
            ctx.font = `${14 / sqrtScale}px Arial`;
            ctx.fillText("O", ox + 8 / sqrtScale, oy - 8 / sqrtScale);
        }

        if (repereStep > 0 && tempRepere.origin) {
            const tempLineWidth = 2 / sqrtScale;
            const tempRadius = 6 / sqrtScale;
            ctx.strokeStyle = '#f59e0b'; // yellow-500
            ctx.fillStyle = '#f59e0b';
            ctx.lineWidth = tempLineWidth;
        
            // Draw origin
            ctx.beginPath();
            ctx.arc(tempRepere.origin.x, tempRepere.origin.y, tempRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw X-axis line if defined
            if (tempRepere.xAxis) {
                ctx.beginPath();
                ctx.moveTo(tempRepere.origin.x, tempRepere.origin.y);
                ctx.lineTo(tempRepere.xAxis.x, tempRepere.xAxis.y);
                ctx.stroke();
            }
        
            // Draw Y-axis line if defined
            if (tempRepere.yAxis) {
                ctx.beginPath();
                ctx.moveTo(tempRepere.origin.x, tempRepere.origin.y);
                ctx.lineTo(tempRepere.yAxis.x, tempRepere.yAxis.y);
                ctx.stroke();
            }
        }
        
        // --- Dessin de l'aide au repère orthogonal (AXE X) ---
        if (repereStep === 2 && tempRepere.origin && repereMousePos) {
            const O = tempRepere.origin;
            const M = repereMousePos;
            const dx = M.x - O.x;
            const dy = M.y - O.y;

            let snappedX = { x: M.x, y: M.y };
            if (Math.abs(dx) > Math.abs(dy)) {
                snappedX.y = O.y; // Snap horizontal
            } else {
                snappedX.x = O.x; // Snap vertical
            }
        
            ctx.strokeStyle = '#f59e0b'; // yellow-500
            ctx.fillStyle = '#f59e0b';
            ctx.lineWidth = 2 / sqrtScale;

            ctx.beginPath();
            ctx.moveTo(O.x, O.y);
            ctx.lineTo(snappedX.x, snappedX.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(snappedX.x, snappedX.y, 6 / sqrtScale, 0, 2 * Math.PI);
            ctx.fill();
        }

        // --- Dessin de l'aide au repère orthogonal (AXE Y) ---
        if (repereStep === 3 && tempRepere.origin && tempRepere.xAxis && repereMousePos) {
            const O = tempRepere.origin;
            const X = tempRepere.xAxis;
            const M = repereMousePos;
        
            const vx = X.x - O.x;
            const vy = X.y - O.y;
        
            // Perpendicular vector
            const p_vx = -vy;
            const p_vy = vx;
        
            // Vector from origin to mouse
            const om_x = M.x - O.x;
            const om_y = M.y - O.y;
        
            // Project OM onto the perpendicular vector
            const dotProduct = om_x * p_vx + om_y * p_vy;
            const p_len_sq = p_vx * p_vx + p_vy * p_vy;
            const scale = p_len_sq === 0 ? 0 : dotProduct / p_len_sq;
        
            const snappedY = {
                x: O.x + scale * p_vx,
                y: O.y + scale * p_vy,
            };
            
            // Draw the snapped Y-axis line
            ctx.strokeStyle = '#f59e0b'; // yellow-500
            ctx.fillStyle = '#f59e0b';
            ctx.lineWidth = 2 / sqrtScale;
        
            ctx.beginPath();
            ctx.moveTo(O.x, O.y);
            ctx.lineTo(snappedY.x, snappedY.y);
            ctx.stroke();
        
            // Draw a point at the snapped position
            ctx.beginPath();
            ctx.arc(snappedY.x, snappedY.y, 6 / sqrtScale, 0, 2 * Math.PI);
            ctx.fill();
        }


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
                    ctx.lineWidth = 2 / sqrtScale;
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
    }, [image, points, dates, viewTransform, displayMode, selectedDate, dateColorMap, uniqueDates, guides, metadata, repereStep, tempRepere, addingPoint, repereMousePos]);

    // Gestion des événements
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (isSettingOrigin) {
                const pos = getMousePos(e);
                if (repereStep === 1) {
                    setTempRepere(prev => ({ ...prev, origin: { ...pos, logicalX: 0, logicalY: 0 } }));
                    setRepereStep(2);
                } else if (repereStep === 2) {
                    if (!tempRepere.origin) return;
                    const O = tempRepere.origin;
                    const M = pos;
                    const dx = M.x - O.x;
                    const dy = M.y - O.y;

                    let snappedX = { x: M.x, y: M.y };
                    if (Math.abs(dx) > Math.abs(dy)) {
                        snappedX.y = O.y; // Snap horizontal
                    } else {
                        snappedX.x = O.x; // Snap vertical
                    }
                    setTempRepere(prev => ({ ...prev, xAxis: { ...snappedX, logicalX: 0, logicalY: 0 } }));
                    setRepereStep(3);
                } else if (repereStep === 3) {
                     if (!tempRepere.origin || !tempRepere.xAxis) return;

                    const O = tempRepere.origin;
                    const X = tempRepere.xAxis;
                    const M = pos; // The click position
            
                    const vx = X.x - O.x;
                    const vy = X.y - O.y;
            
                    // Perpendicular vector
                    const p_vx = -vy;
                    const p_vy = vx;
            
                    // Vector from origin to mouse
                    const om_x = M.x - O.x;
                    const om_y = M.y - O.y;
            
                    // Project OM onto the perpendicular vector
                    const dotProduct = om_x * p_vx + om_y * p_vy;
                    const p_len_sq = p_vx * p_vx + p_vy * p_vy;
            
                    const scale = p_len_sq === 0 ? 0 : dotProduct / p_len_sq;
            
                    const snappedY = {
                        x: O.x + scale * p_vx,
                        y: O.y + scale * p_vy,
                    };

                    setTempRepere(prev => ({ ...prev, yAxis: { ...snappedY, logicalX: 0, logicalY: 0 } }));
                    setRepereStep(4);
                    setRepereMousePos(null);
                }
                return; // Prevent other mousedown logic
            }

            if (addingPoint) {
                const pos = getMousePos(e);
                setTempPoint(pos);
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
            if (isSettingOrigin && (repereStep === 2 || repereStep === 3)) {
                const pos = getMousePos(e);
                setRepereMousePos(pos);
                return;
            }

            if (addingPoint) return;

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
                setViewTransform(prev => ({
                    ...prev,
                    offsetX: prev.offsetX + dx,
                    offsetY: prev.offsetY + dy
                }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
            }

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
            if (addingPoint || isSettingOrigin) return;

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
    }, [getMousePos, findPointIndexAt, addPoint, dragInfo, isPanning, lastMousePos, selectedDate, setDates, setPoints, viewTransform, isRotating, addingPoint, tempPoint, isSettingOrigin, repereStep, tempRepere]);

    const getOverlayMessage = () => {
        if (addingPoint) return "Cliquez pour placer le nouveau point";
        if (isSettingOrigin) {
            switch (repereStep) {
                case 1: return "Étape 1/3 : Cliquez pour définir le nouveau point d'origine (O)";
                case 2: return "Étape 2/3 : Cliquez pour définir l'extrémité de l'axe des X";
                case 3: return "Étape 3/3 : Cliquez pour définir l'extrémité de l'axe des Y";
                default: return "";
            }
        }
        return "";
    };

    const overlayMessage = getOverlayMessage();

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
            <canvas
                ref={canvasRef}
                className="cursor-crosshair"
                style={{
                    cursor: isSettingOrigin
                        ? 'copy'
                        : isRotating
                            ? 'grabbing'
                            : isPanning
                                ? 'grabbing'
                                : 'crosshair'
                }}
            />
            <div className="absolute top-2 right-4 text-white text-md bg-black p-2 bg-opacity-50 rounded">
                {/* <div>🔄 Shift + clic gauche = rotation</div> */}
                <div>🖐 Ctrl/clic milieu = déplacer image</div>
                <div>➕ Alt + clic gauche = guides</div>
            </div>
            {tempPoint && (
                <div
                    className="absolute"
                    style={{
                        transform: `translate(${tempPoint.x * viewTransform.scale + viewTransform.offsetX + 10}px, ${tempPoint.y * viewTransform.scale + viewTransform.offsetY + 10}px)`
                    }}
                >
                    <div className="bg-white p-2 border rounded shadow-md flex flex-col gap-2">
                        <span>Nouveau repère</span>
                        <div className="flex flex-col gap-1">
                            <label>
                                X:
                                <input
                                    type="number"
                                    value={tempPoint.x.toFixed(2)}
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
                                    value={tempPoint.y.toFixed(2)}
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
                                }}
                                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={cancelAddingPoint}
                                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {repereStep === 4 && tempRepere.origin && tempRepere.xAxis && tempRepere.yAxis && (
                <div
                    className="absolute"
                    style={{
                        left: `${tempRepere.origin.x * viewTransform.scale + viewTransform.offsetX}px`,
                        top: `${tempRepere.origin.y * viewTransform.scale + viewTransform.offsetY}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="bg-white p-4 border rounded shadow-lg flex flex-col gap-3 w-64">
                        <span className="font-bold text-lg text-gray-800 text-center">Confirmer le nouveau repère ?</span>
                        <p className="text-sm text-gray-600 text-center">
                            Cette action va recalculer la position de tous les points existants.
                        </p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    saveNewOrigin(tempRepere as { origin: Point; xAxis: Point; yAxis: Point });
                                }}
                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-semibold text-sm"
                            >
                                Enregistrer
                            </button>
                            <button
                                onClick={() => {
                                    setIsSettingOrigin(false);
                                }}
                                className="flex-1 bg-gray-300 px-3 py-2 rounded hover:bg-gray-400 font-semibold text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {overlayMessage && (
                <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none flex items-center justify-center">
                    <p className="text-white text-2xl font-bold bg-black bg-opacity-50 p-4 rounded-md animate-pulse">
                        {overlayMessage}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CanvasComponent;