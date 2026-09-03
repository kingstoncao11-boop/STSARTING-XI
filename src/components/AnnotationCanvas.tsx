import React, { useRef, useState, useCallback } from 'react';
import { Annotation, AnnotationPoint, AnnotationTool } from '../types';

interface AnnotationCanvasProps {
  annotations: Annotation[];
  currentTool: AnnotationTool;
  currentColor: string;
  currentStrokeWidth: number;
  isDrawingMode: boolean;
  onAddAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  width: number;
  height: number;
}

// Compute mathematically precise arrowhead polygon in 0-100 viewBox space,
// taking the pitch aspect ratio (height / width) into account so arrowheads are never squeezed or distorted.
function computeArrowGeometry(
  p1: AnnotationPoint,
  p2: AnnotationPoint,
  aspectRatio: number,
  strokeWidth: number
) {
  const R = aspectRatio > 0 ? aspectRatio : 1000 / 680; // height / width
  const dx = p2.x - p1.x;
  const dy = (p2.y - p1.y) * R;
  const len = Math.hypot(dx, dy);

  if (len < 0.5) {
    return { shaftEnd: p2, arrowheadPath: '' };
  }

  const theta = Math.atan2(dy, dx);
  // Arrowhead sizing based on stroke width
  const headLen = Math.max(3.2, Math.min(5.5, 2.6 + strokeWidth * 0.45));
  const halfAngle = 0.42; // ~24 degrees
  const notchLen = headLen * 0.3;

  // Tip point
  const tipX = p2.x;
  const tipY = p2.y;

  // Left wing
  const leftX = tipX - headLen * Math.cos(theta - halfAngle);
  const leftY = (tipY * R - headLen * Math.sin(theta - halfAngle)) / R;

  // Right wing
  const rightX = tipX - headLen * Math.cos(theta + halfAngle);
  const rightY = (tipY * R - headLen * Math.sin(theta + halfAngle)) / R;

  // Notch
  const notchX = tipX - (headLen - notchLen) * Math.cos(theta);
  const notchY = (tipY * R - (headLen - notchLen) * Math.sin(theta)) / R;

  const arrowheadPath = `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${leftX.toFixed(2)} ${leftY.toFixed(2)} L ${notchX.toFixed(2)} ${notchY.toFixed(2)} L ${rightX.toFixed(2)} ${rightY.toFixed(2)} Z`;

  return {
    shaftEnd: { x: notchX, y: notchY },
    arrowheadPath,
  };
}

// Tangent calculation at the end of a quadratic curve
function computeCurvedArrowGeometry(
  p1: AnnotationPoint,
  ctrl: AnnotationPoint,
  p2: AnnotationPoint,
  aspectRatio: number,
  strokeWidth: number
) {
  const R = aspectRatio > 0 ? aspectRatio : 1000 / 680;
  // Tangent at end of quadratic bezier B(t) as t->1 is 2*(p2 - ctrl)
  const dx = p2.x - ctrl.x;
  const dy = (p2.y - ctrl.y) * R;
  const len = Math.hypot(dx, dy);

  if (len < 0.5) {
    return { shaftEnd: p2, arrowheadPath: '' };
  }

  const theta = Math.atan2(dy, dx);
  const headLen = Math.max(3.2, Math.min(5.5, 2.6 + strokeWidth * 0.45));
  const halfAngle = 0.42;
  const notchLen = headLen * 0.3;

  const tipX = p2.x;
  const tipY = p2.y;

  const leftX = tipX - headLen * Math.cos(theta - halfAngle);
  const leftY = (tipY * R - headLen * Math.sin(theta - halfAngle)) / R;

  const rightX = tipX - headLen * Math.cos(theta + halfAngle);
  const rightY = (tipY * R - headLen * Math.sin(theta + halfAngle)) / R;

  const notchX = tipX - (headLen - notchLen) * Math.cos(theta);
  const notchY = (tipY * R - (headLen - notchLen) * Math.sin(theta)) / R;

  const arrowheadPath = `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${leftX.toFixed(2)} ${leftY.toFixed(2)} L ${notchX.toFixed(2)} ${notchY.toFixed(2)} L ${rightX.toFixed(2)} ${rightY.toFixed(2)} Z`;

  return {
    shaftEnd: { x: notchX, y: notchY },
    arrowheadPath,
  };
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  annotations,
  currentTool,
  currentColor,
  currentStrokeWidth,
  isDrawingMode,
  onAddAnnotation,
  onDeleteAnnotation,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  const aspectRatio = height > 0 && width > 0 ? height / width : 1000 / 680;

  const getCoordinates = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): AnnotationPoint | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      return { x, y };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingMode) return;
    if (currentTool === 'eraser' || currentTool === 'select') return;

    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pt = getCoordinates(e);
    if (!pt) return;

    if (currentTool === 'text') {
      const label = prompt('Enter tactical annotation text (e.g., PRESS, OVERLOAD, 1v1, LOW BLOCK):');
      if (label && label.trim()) {
        const newAnn: Annotation = {
          id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tool: 'text',
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          points: [pt],
          label: label.trim(),
        };
        onAddAnnotation(newAnn);
      }
      return;
    }

    setIsInteracting(true);
    setCurrentPoints([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !isInteracting) return;
    const pt = getCoordinates(e);
    if (!pt) return;

    if (currentTool === 'pen') {
      setCurrentPoints((prev) => [...prev, pt]);
    } else {
      // 2-point tools (arrow, dashed-arrow, line, curved-arrow, circle, rect, highlight)
      setCurrentPoints((prev) => (prev.length > 0 ? [prev[0], pt] : [pt]));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !isInteracting) return;
    setIsInteracting(false);

    if (currentPoints.length < 2 && currentTool !== 'circle' && currentTool !== 'highlight' && currentTool !== 'rect') {
      setCurrentPoints([]);
      return;
    }

    let finalPoints = [...currentPoints];
    let radius = undefined;

    if (currentTool === 'curved-arrow' && currentPoints.length >= 2) {
      const p1 = currentPoints[0];
      const p2 = currentPoints[currentPoints.length - 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const curveOffset = Math.min(18, Math.max(6, dist * 0.28));

      // Perpendicular control point offset
      const normalX = -(dy / (dist || 1)) * curveOffset;
      const normalY = (dx / (dist || 1)) * curveOffset;
      const ctrlX = Math.max(2, Math.min(98, midX + normalX));
      const ctrlY = Math.max(2, Math.min(98, midY + normalY));
      finalPoints = [p1, { x: ctrlX, y: ctrlY }, p2];
    } else if (currentTool === 'circle' || currentTool === 'highlight') {
      if (currentPoints.length >= 2) {
        const p1 = currentPoints[0];
        const p2 = currentPoints[currentPoints.length - 1];
        radius = Math.hypot(p2.x - p1.x, (p2.y - p1.y) * (aspectRatio || 1.47));
      } else if (currentPoints.length === 1) {
        radius = 8;
      }
    }

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tool: currentTool,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      points: finalPoints,
      radius,
    };

    onAddAnnotation(newAnnotation);
    setCurrentPoints([]);
  };

  const renderAnnotation = (ann: Annotation, isDraft = false) => {
    const stroke = ann.color;
    const strokeWidth = ann.strokeWidth;
    const pts = ann.points;
    if (!pts || pts.length === 0) return null;

    const isEraserTarget = isDrawingMode && currentTool === 'eraser' && hoveredAnnotationId === ann.id;

    const commonProps = {
      stroke,
      strokeWidth,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      className: `transition-all duration-150 ${
        isEraserTarget
          ? 'opacity-40 stroke-rose-400 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
          : 'opacity-95 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
      } ${isDrawingMode && currentTool === 'eraser' ? 'cursor-pointer hover:stroke-rose-400' : ''}`,
      onClick: (e: React.MouseEvent) => {
        if (isDrawingMode && currentTool === 'eraser') {
          e.stopPropagation();
          onDeleteAnnotation(ann.id);
        }
      },
      onMouseEnter: () => setHoveredAnnotationId(ann.id),
      onMouseLeave: () => setHoveredAnnotationId(null),
    };

    switch (ann.tool) {
      case 'pen': {
        if (pts.length < 2) return null;
        const d = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`, '');
        return <path key={ann.id} d={d} fill="none" {...commonProps} />;
      }

      case 'line': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        return (
          <line
            key={ann.id}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            fill="none"
            {...commonProps}
          />
        );
      }

      case 'arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);

        return (
          <g key={ann.id} className={commonProps.className} onClick={commonProps.onClick} onMouseEnter={commonProps.onMouseEnter} onMouseLeave={commonProps.onMouseLeave}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
          </g>
        );
      }

      case 'dashed-arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);

        return (
          <g key={ann.id} className={commonProps.className} onClick={commonProps.onClick} onMouseEnter={commonProps.onMouseEnter} onMouseLeave={commonProps.onMouseLeave}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray="3,2.5"
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
          </g>
        );
      }

      case 'press-arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth * 1.15);

        return (
          <g key={ann.id} className={commonProps.className} onClick={commonProps.onClick} onMouseEnter={commonProps.onMouseEnter} onMouseLeave={commonProps.onMouseLeave}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 1.2}
              strokeDasharray="2,2"
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
          </g>
        );
      }

      case 'curved-arrow': {
        if (pts.length < 2) return null;
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const ctrl = pts.length === 3 ? pts[1] : { x: (p1.x + p2.x) / 2 - 8, y: (p1.y + p2.y) / 2 - 8 };
        const { shaftEnd, arrowheadPath } = computeCurvedArrowGeometry(p1, ctrl, p2, aspectRatio, strokeWidth);
        const d = `M ${p1.x} ${p1.y} Q ${ctrl.x} ${ctrl.y} ${shaftEnd.x} ${shaftEnd.y}`;

        return (
          <g key={ann.id} className={commonProps.className} onClick={commonProps.onClick} onMouseEnter={commonProps.onMouseEnter} onMouseLeave={commonProps.onMouseLeave}>
            <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
          </g>
        );
      }

      case 'movement': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);

        return (
          <g key={ann.id} className={commonProps.className} onClick={commonProps.onClick} onMouseEnter={commonProps.onMouseEnter} onMouseLeave={commonProps.onMouseLeave}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray="5,2"
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
          </g>
        );
      }

      case 'circle': {
        const center = pts[0];
        const rad = ann.radius || (pts[1] ? Math.hypot(pts[1].x - pts[0].x, (pts[1].y - pts[0].y) * (aspectRatio || 1.47)) : 6);
        return (
          <ellipse
            key={ann.id}
            cx={center.x}
            cy={center.y}
            rx={rad}
            ry={rad / (aspectRatio || 1.47)}
            fill="none"
            strokeDasharray={ann.strokeWidth > 2.5 ? 'none' : '3,2.5'}
            {...commonProps}
          />
        );
      }

      case 'rect': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const w = Math.max(1, Math.abs(p2.x - p1.x));
        const h = Math.max(1, Math.abs(p2.y - p1.y));

        return (
          <rect
            key={ann.id}
            x={minX}
            y={minY}
            width={w}
            height={h}
            rx={2}
            ry={2}
            fill={stroke}
            fillOpacity={0.12}
            strokeDasharray="3,2.5"
            {...commonProps}
          />
        );
      }

      case 'highlight': {
        const center = pts[0];
        const rad = ann.radius || (pts[1] ? Math.hypot(pts[1].x - pts[0].x, (pts[1].y - pts[0].y) * (aspectRatio || 1.47)) : 10);
        return (
          <ellipse
            key={ann.id}
            cx={center.x}
            cy={center.y}
            rx={rad}
            ry={rad / (aspectRatio || 1.47)}
            fill={stroke}
            fillOpacity={0.22}
            stroke={stroke}
            strokeWidth={1.5}
            strokeDasharray="4,3"
            className={`transition-all duration-150 ${
              isEraserTarget ? 'opacity-40 fill-rose-500/40' : 'opacity-90'
            } ${isDrawingMode && currentTool === 'eraser' ? 'cursor-pointer' : ''}`}
            onClick={(e: React.MouseEvent) => {
              if (isDrawingMode && currentTool === 'eraser') {
                e.stopPropagation();
                onDeleteAnnotation(ann.id);
              }
            }}
            onMouseEnter={() => setHoveredAnnotationId(ann.id)}
            onMouseLeave={() => setHoveredAnnotationId(null)}
          />
        );
      }

      case 'text': {
        const pt = pts[0];
        return (
          <g
            key={ann.id}
            className={`select-none ${isEraserTarget ? 'opacity-30' : 'opacity-100'} ${
              isDrawingMode && currentTool === 'eraser' ? 'cursor-pointer hover:opacity-50' : ''
            }`}
            onClick={(e) => {
              if (isDrawingMode && currentTool === 'eraser') {
                e.stopPropagation();
                onDeleteAnnotation(ann.id);
              }
            }}
            onMouseEnter={() => setHoveredAnnotationId(ann.id)}
            onMouseLeave={() => setHoveredAnnotationId(null)}
          >
            <text
              x={pt.x}
              y={pt.y}
              fill={stroke}
              fontSize="3.8"
              fontWeight="900"
              letterSpacing="0.05em"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              stroke="#000000"
              strokeWidth="0.6"
              paintOrder="stroke"
            >
              {ann.label || 'TACTIC'}
            </text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  // In-progress draft drawing
  const renderDraft = () => {
    if (!isInteracting || currentPoints.length === 0) return null;
    const draftAnn: Annotation = {
      id: 'draft-ann',
      tool: currentTool,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      points: currentPoints,
      radius:
        currentTool === 'circle' || currentTool === 'highlight'
          ? currentPoints[1]
            ? Math.hypot(currentPoints[1].x - currentPoints[0].x, (currentPoints[1].y - currentPoints[0].y) * (aspectRatio || 1.47))
            : 5
          : undefined,
    };
    return renderAnnotation(draftAnn, true);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`absolute inset-0 w-full h-full z-10 select-none ${
        isDrawingMode
          ? currentTool === 'eraser'
            ? 'cursor-pointer'
            : 'cursor-crosshair'
          : 'pointer-events-none'
      }`}
      style={{ touchAction: isDrawingMode ? 'none' : 'auto' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {annotations.map((ann) => renderAnnotation(ann))}
      {renderDraft()}
    </svg>
  );
};
