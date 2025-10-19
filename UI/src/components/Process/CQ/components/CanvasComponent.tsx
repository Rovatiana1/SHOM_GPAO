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
    isSettingOrigin: boolean;
    setIsSettingOrigin: React.Dispatch<React.SetStateAction<boolean>>;
    saveNewOrigin: (repere: { origin: Point; xAxis: Point; yAxis: Point }) => void;
    isCaptureMode: boolean;
    onCapture: (dataUrl: string) => void;
    onCancelCapture: () => void;
    selectedPointIndices: number[];
    setSelectedPointIndices: React.Dispatch<React.SetStateAction<number[]>>;
    onDeleteSelected: () => void;
}

const POINT_RADIUS = 5;
const HOVER_RADIUS = 15;

const CanvasComponent: React.FC<CanvasProps> = ({
    image,
    points,
    setPoints,
    setDates,
    dates,
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
    saveNewOrigin,
    isCaptureMode,
    onCapture,
    onCancelCapture,
    selectedPointIndices,
    setSelectedPointIndices,
    onDeleteSelected,
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

    // Capture selection state
    const [isSelectingCapture, setIsSelectingCapture] = useState(false);
    const [captureSelectionRect, setCaptureSelectionRect] = useState<{ startX: number; startY: number; endX: number; endY: number; } | null>(null);

    // Point multi-selection state
    const [isSelectingPoints, setIsSelectingPoints] = useState(false);
    const [pointSelectionRect, setPointSelectionRect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
    const [isGroupDragging, setIsGroupDragging] = useState(false);

    useEffect(() => {
        if (isSettingOrigin) {
            setRepereStep(1);
        } else {
            setRepereStep(0);
            setTempRepere({ origin: null, xAxis: null, yAxis: null });
            setRepereMousePos(null);
        }
    }, [isSettingOrigin]);

    // Effect for keyboard shortcuts (Escape, Delete, Backspace)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts if an input is focused
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            if (e.key === 'Escape') {
                if (isCaptureMode) onCancelCapture();
                if (selectedPointIndices.length > 0) setSelectedPointIndices([]);
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointIndices.length > 0) {
                e.preventDefault(); // Prevents browser from navigating back on backspace
                onDeleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCaptureMode, onCancelCapture, selectedPointIndices, setSelectedPointIndices, onDeleteSelected]);

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

    const getMousePosInViewport = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return { x, y };
    }, []);

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

        ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
        ctx.scale(viewTransform.scale, viewTransform.scale);

        ctx.drawImage(image, 0, 0);
        if (isCaptureMode) {
            ctx.restore();
            return;
        }

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

        if (repereStep > 0 && tempRepere.origin) {
            const tempLineWidth = 2 / sqrtScale;
            const tempRadius = 6 / sqrtScale;
            ctx.strokeStyle = '#f59e0b';
            ctx.fillStyle = '#f59e0b';
            ctx.lineWidth = tempLineWidth;
        
            ctx.beginPath();
            ctx.arc(tempRepere.origin.x, tempRepere.origin.y, tempRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            if (tempRepere.xAxis) {
                ctx.beginPath();
                ctx.moveTo(tempRepere.origin.x, tempRepere.origin.y);
                ctx.lineTo(tempRepere.xAxis.x, tempRepere.xAxis.y);
                ctx.stroke();
            }
        
            if (tempRepere.yAxis) {
                ctx.beginPath();
                ctx.moveTo(tempRepere.origin.x, tempRepere.origin.y);
                ctx.lineTo(tempRepere.yAxis.x, tempRepere.yAxis.y);
                ctx.stroke();
            }
        }
        
        if (repereStep === 2 && tempRepere.origin && repereMousePos) {
            const O = tempRepere.origin;
            const M = repereMousePos;
            const dx = M.x - O.x;
            const dy = M.y - O.y;

            let snappedX = { x: M.x, y: M.y };
            if (Math.abs(dx) > Math.abs(dy)) {
                snappedX.y = O.y;
            } else {
                snappedX.x = O.x;
            }
        
            ctx.strokeStyle = '#f59e0b';
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

        if (repereStep === 3 && tempRepere.origin && tempRepere.xAxis && repereMousePos) {
            const O = tempRepere.origin;
            const X = tempRepere.xAxis;
            const M = repereMousePos;
        
            const vx = X.x - O.x;
            const vy = X.y - O.y;
        
            const p_vx = -vy;
            const p_vy = vx;
        
            const om_x = M.x - O.x;
            const om_y = M.y - O.y;
        
            const dotProduct = om_x * p_vx + om_y * p_vy;
            const p_len_sq = p_vx * p_vx + p_vy * p_vy;
            const scale = p_len_sq === 0 ? 0 : dotProduct / p_len_sq;
        
            const snappedY = {
                x: O.x + scale * p_vx,
                y: O.y + scale * p_vy,
            };
            
            ctx.strokeStyle = '#f59e0b';
            ctx.fillStyle = '#f59e0b';
            ctx.lineWidth = 2 / sqrtScale;
        
            ctx.beginPath();
            ctx.moveTo(O.x, O.y);
            ctx.lineTo(snappedY.x, snappedY.y);
            ctx.stroke();
        
            ctx.beginPath();
            ctx.arc(snappedY.x, snappedY.y, 6 / sqrtScale, 0, 2 * Math.PI);
            ctx.fill();
        }

        points.forEach((point, i) => {
            if (selectedPointIndices.includes(i)) {
                ctx.strokeStyle = '#f59e0b'; // yellow-500
                ctx.lineWidth = 3 / sqrtScale;
                ctx.beginPath();
                ctx.arc(point.x, point.y, (POINT_RADIUS + 4) / sqrtScale, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });

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
    }, [image, points, dates, viewTransform, displayMode, selectedDate, dateColorMap, uniqueDates, guides, metadata, repereStep, tempRepere, addingPoint, repereMousePos, isCaptureMode, selectedPointIndices]);

    // Gestion des événements
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (e.shiftKey && e.button === 0 && selectedDate) {
                e.preventDefault();
                setIsSelectingPoints(true);
                const pos = getMousePosInViewport(e);
                setPointSelectionRect({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
                return;
            }

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
                        snappedX.y = O.y;
                    } else {
                        snappedX.x = O.x;
                    }
                    setTempRepere(prev => ({ ...prev, xAxis: { ...snappedX, logicalX: 0, logicalY: 0 } }));
                    setRepereStep(3);
                } else if (repereStep === 3) {
                     if (!tempRepere.origin || !tempRepere.xAxis) return;

                    const O = tempRepere.origin;
                    const X = tempRepere.xAxis;
                    const M = pos;
            
                    const vx = X.x - O.x;
                    const vy = X.y - O.y;
            
                    const p_vx = -vy;
                    const p_vy = vx;
            
                    const om_x = M.x - O.x;
                    const om_y = M.y - O.y;
            
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
                return;
            }

            if (addingPoint) {
                const pos = getMousePos(e);
                setTempPoint(pos);
                return;
            }

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

            const pointIndex = findPointIndexAt(pos);

            if (e.button === 0) {
                 if (pointIndex !== -1 && selectedPointIndices.includes(pointIndex)) {
                    setIsGroupDragging(true);
                    setLastMousePos({ x: e.clientX, y: e.clientY });
                    return;
                }

                if (pointIndex !== -1) {
                    setSelectedPointIndices([]);
                    setDragInfo({ index: pointIndex, isDragging: true });
                } else if (selectedDate) {
                    setSelectedPointIndices([]);
                    addPoint(pos);
                } else {
                    setSelectedPointIndices([]);
                }
            } else if (e.button === 2 && pointIndex !== -1) {
                setPoints(prev => prev.filter((_, i) => i !== pointIndex));
                setDates(prev => prev.filter((_, i) => i !== pointIndex));
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isSelectingPoints && pointSelectionRect) {
                const pos = getMousePosInViewport(e);
                setPointSelectionRect(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null);
                return;
            }

            if (isSettingOrigin && (repereStep === 2 || repereStep === 3)) {
                const pos = getMousePos(e);
                setRepereMousePos(pos);
                return;
            }

            if (addingPoint) return;

            const pos = getMousePos(e);

            if (isGroupDragging && lastMousePos) {
                const dxClient = e.clientX - lastMousePos.x;
                const dyClient = e.clientY - lastMousePos.y;
                const dxCanvas = dxClient / viewTransform.scale;
                const dyCanvas = dyClient / viewTransform.scale;

                setPoints(currentPoints => {
                    const newPoints = [...currentPoints];
                    selectedPointIndices.forEach(index => {
                        const p = newPoints[index];
                        if (p) {
                            newPoints[index] = { ...p, x: p.x + dxCanvas, y: p.y + dyCanvas };
                        }
                    });
                    return newPoints;
                });
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
            if (isSelectingPoints && pointSelectionRect) {
                const { startX, startY, endX, endY } = pointSelectionRect;
                const rectX1 = (Math.min(startX, endX) - viewTransform.offsetX) / viewTransform.scale;
                const rectY1 = (Math.min(startY, endY) - viewTransform.offsetY) / viewTransform.scale;
                const rectX2 = (Math.max(startX, endX) - viewTransform.offsetX) / viewTransform.scale;
                const rectY2 = (Math.max(startY, endY) - viewTransform.offsetY) / viewTransform.scale;

                const indicesInRect = points.reduce((acc, point, index) => {
                    if (
                        dates[index] === selectedDate &&
                        point.x >= rectX1 && point.x <= rectX2 &&
                        point.y >= rectY1 && point.y <= rectY2
                    ) {
                        acc.push(index);
                    }
                    return acc;
                }, [] as number[]);
                
                setSelectedPointIndices(indicesInRect);
            }
            
            setIsPanning(false);
            setIsRotating(false);
            setDragInfo(null);
            setLastMousePos(null);
            setIsGroupDragging(false);
            setIsSelectingPoints(false);
            setPointSelectionRect(null);
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
    }, [getMousePos, getMousePosInViewport, findPointIndexAt, addPoint, dragInfo, isPanning, lastMousePos, selectedDate, setDates, setPoints, viewTransform, isRotating, addingPoint, tempPoint, isSettingOrigin, repereStep, tempRepere, selectedPointIndices, setSelectedPointIndices, isGroupDragging, isSelectingPoints, pointSelectionRect]);

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

    // Handlers for capture selection
    const handleCaptureMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        e.stopPropagation();

        const canvasRect = canvas.getBoundingClientRect();
        const startX = e.clientX - canvasRect.left;
        const startY = e.clientY - canvasRect.top;

        if (startX < 0 || startX > canvasRect.width || startY < 0 || startY > canvasRect.height) {
            return;
        }
        
        setIsSelectingCapture(true);
        setCaptureSelectionRect({
            startX: startX,
            startY: startY,
            endX: startX,
            endY: startY,
        });
    };

    const handleCaptureMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelectingCapture || !captureSelectionRect) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();

        setCaptureSelectionRect({
            ...captureSelectionRect,
            endX: e.clientX - canvasRect.left,
            endY: e.clientY - canvasRect.top,
        });
    };
    const handleCaptureMouseUp = () => {
        if (!isSelectingCapture || !captureSelectionRect) return;
    
        const { startX, startY, endX, endY } = captureSelectionRect;
        const width = Math.abs(startX - endX);
        const height = Math.abs(startY - endY);
    
        setIsSelectingCapture(false);
        setCaptureSelectionRect(null);

        if (width < 10 || height < 10) {
            return;
        }
    
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const rect = {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width,
            height
        };
        
        const imageX = (rect.x - viewTransform.offsetX) / viewTransform.scale;
        const imageY = (rect.y - viewTransform.offsetY) / viewTransform.scale;
        const imageWidth = rect.width / viewTransform.scale;
        const imageHeight = rect.height / viewTransform.scale;
    
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
    
        tempCtx.drawImage(image, imageX, imageY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
        
        const dataUrl = tempCanvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
    };

    const getSelectionStyle = (rect: { startX: number; startY: number; endX: number; endY: number } | null): React.CSSProperties => {
        if (!rect) return {};
        const { startX, startY, endX, endY } = rect;
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(startX - endX);
        const height = Math.abs(startY - endY);
        return {
            left: x,
            top: y,
            width,
            height,
            position: 'absolute',
            border: '2px dashed white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            pointerEvents: 'none',
        };
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 relative">
            <canvas
                ref={canvasRef}
                className="cursor-crosshair"
                style={{
                    cursor: isCaptureMode ? 'crosshair'
                        : isSelectingPoints ? 'crosshair'
                        : isSettingOrigin ? 'copy'
                        : isGroupDragging ? 'grabbing'
                        : isPanning ? 'grabbing'
                        : 'crosshair'
                }}
            />
            <div className="absolute top-2 right-4 text-white text-md bg-black p-2 bg-opacity-50 rounded">
                <div>🖐 Ctrl/clic milieu = déplacer image</div>
                <div>➕ Alt + clic gauche = guides</div>
                <div><span className='font-bold'>Shift</span> + clic gauche = sélectionner</div>
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
            
            {isSelectingPoints && pointSelectionRect && (
                <div style={getSelectionStyle(pointSelectionRect)} />
            )}

            {isCaptureMode && (
                <div
                    className="absolute inset-0 bg-black bg-opacity-30 z-50"
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={handleCaptureMouseDown}
                    onMouseMove={handleCaptureMouseMove}
                    onMouseUp={handleCaptureMouseUp}
                    onMouseLeave={() => setIsSelectingCapture(false)}
                >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white py-1 px-3 rounded shadow-lg text-gray-800 font-semibold pointer-events-none text-sm">
                        Cliquez et glissez pour sélectionner une zone. Appuyez sur 'Echap' pour annuler.
                    </div>
                    {captureSelectionRect && (
                         <div style={getSelectionStyle(captureSelectionRect)} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CanvasComponent;