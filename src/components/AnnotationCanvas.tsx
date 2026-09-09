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
  showActionLabels?: boolean;
}

// Compute mathematically precise standard arrowhead polygon in 0-100 viewBox space
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

// Compute double-chevron arrowhead for aggressive pressing action (>>), ensuring immediate differentiation
function computeDoubleChevronGeometry(
  p1: AnnotationPoint,
  p2: AnnotationPoint,
  aspectRatio: number,
  strokeWidth: number
) {
  const R = aspectRatio > 0 ? aspectRatio : 1000 / 680;
  const dx = p2.x - p1.x;
  const dy = (p2.y - p1.y) * R;
  const len = Math.hypot(dx, dy);

  if (len < 0.5) {
    return { shaftEnd: p2, arrowheadPath: '', secondChevronPath: '' };
  }

  const theta = Math.atan2(dy, dx);
  const headLen = Math.max(3.5, Math.min(6.0, 2.8 + strokeWidth * 0.5));
  const halfAngle = 0.46; // sharper, aggressive angle
  const notchLen = headLen * 0.38;

  const tipX = p2.x;
  const tipY = p2.y;

  const leftX = tipX - headLen * Math.cos(theta - halfAngle);
  const leftY = (tipY * R - headLen * Math.sin(theta - halfAngle)) / R;

  const rightX = tipX - headLen * Math.cos(theta + halfAngle);
  const rightY = (tipY * R - headLen * Math.sin(theta + halfAngle)) / R;

  const notchX = tipX - (headLen - notchLen) * Math.cos(theta);
  const notchY = (tipY * R - (headLen - notchLen) * Math.sin(theta)) / R;

  const arrowheadPath = `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${leftX.toFixed(2)} ${leftY.toFixed(2)} L ${notchX.toFixed(2)} ${notchY.toFixed(2)} L ${rightX.toFixed(2)} ${rightY.toFixed(2)} Z`;

  // Secondary chevron offset behind primary
  const offset = headLen * 0.85;
  const c2TipX = tipX - offset * Math.cos(theta);
  const c2TipY = (tipY * R - offset * Math.sin(theta)) / R;
  const c2Len = headLen * 0.85;
  const c2LeftX = c2TipX - c2Len * Math.cos(theta - halfAngle);
  const c2LeftY = (c2TipY * R - c2Len * Math.sin(theta - halfAngle)) / R;
  const c2RightX = c2TipX - c2Len * Math.cos(theta + halfAngle);
  const c2RightY = (c2TipY * R - c2Len * Math.sin(theta + halfAngle)) / R;

  const secondChevronPath = `M ${c2LeftX.toFixed(2)} ${c2LeftY.toFixed(2)} L ${c2TipX.toFixed(2)} ${c2TipY.toFixed(2)} L ${c2RightX.toFixed(2)} ${c2RightY.toFixed(2)}`;

  const finalShaftX = c2TipX - notchLen * 0.4 * Math.cos(theta);
  const finalShaftY = (c2TipY * R - notchLen * 0.4 * Math.sin(theta)) / R;

  return {
    shaftEnd: { x: finalShaftX, y: finalShaftY },
    arrowheadPath,
    secondChevronPath,
  };
}

// Compute authentic tactical zig-zag / sawtooth pressing shaft (signifies defensive pressure / closing down)
function computeZigzagPath(
  p1: AnnotationPoint,
  p2: AnnotationPoint,
  aspectRatio: number,
  strokeWidth: number
) {
  const R = aspectRatio > 0 ? aspectRatio : 1000 / 680;
  const dx = p2.x - p1.x;
  const dy = (p2.y - p1.y) * R;
  const len = Math.hypot(dx, dy);

  if (len < 4.5) {
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  // Normal vector perpendicular to line in normalized space
  const nx = -dy / len;
  const ny = (dx / len) / R;
  const amplitude = Math.max(1.1, Math.min(2.0, 0.8 + strokeWidth * 0.22));
  const wavelength = 3.6;
  const numSteps = Math.max(3, Math.min(12, Math.floor(len / wavelength)));

  let path = `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  for (let i = 1; i <= numSteps; i++) {
    const t = i / (numSteps + 1);
    const baseX = p1.x + dx * t;
    const baseY = p1.y + (dy / R) * t;
    const sign = i % 2 === 1 ? 1 : -1;
    const px = baseX + nx * amplitude * sign;
    const py = baseY + ny * amplitude * sign;
    path += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
  }
  path += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  return path;
}

// Compute smooth wavy sinusoidal path for dribble / ball carrying
function computeWavyPath(
  p1: AnnotationPoint,
  p2: AnnotationPoint,
  aspectRatio: number,
  strokeWidth: number
) {
  const R = aspectRatio > 0 ? aspectRatio : 1000 / 680;
  const dx = p2.x - p1.x;
  const dy = (p2.y - p1.y) * R;
  const len = Math.hypot(dx, dy);

  if (len < 4) {
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const nx = -dy / len;
  const ny = (dx / len) / R;
  const amplitude = Math.max(0.9, Math.min(1.8, 0.7 + strokeWidth * 0.2));
  const wavelength = 4.2;
  const waves = Math.max(2, Math.min(10, Math.floor(len / wavelength)));

  let path = `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  for (let i = 0; i < waves; i++) {
    const t0 = i / waves;
    const t1 = (i + 0.5) / waves;
    const t2 = (i + 1) / waves;

    const cp1x = p1.x + dx * (t0 + 0.25) + nx * amplitude;
    const cp1y = p1.y + (dy / R) * (t0 + 0.25) + ny * amplitude;
    const midx = p1.x + dx * t1;
    const midy = p1.y + (dy / R) * t1;

    const cp2x = p1.x + dx * (t1 + 0.25) - nx * amplitude;
    const cp2y = p1.y + (dy / R) * (t1 + 0.25) - ny * amplitude;
    const endx = i === waves - 1 ? p2.x : p1.x + dx * t2;
    const endy = i === waves - 1 ? p2.y : p1.y + (dy / R) * t2;

    path += ` Q ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${midx.toFixed(2)} ${midy.toFixed(2)}`;
    path += ` Q ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${endx.toFixed(2)} ${endy.toFixed(2)}`;
  }
  return path;
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

// Helper to provide clear action names for annotations
function getActionBadgeInfo(tool: AnnotationTool): { text: string; icon: string } | null {
  switch (tool) {
    case 'press-arrow':
      return { text: 'PRESS', icon: '⚡' };
    case 'dashed-arrow':
      return { text: 'PASS', icon: '⚽' };
    case 'arrow':
      return { text: 'RUN', icon: '🏃' };
    case 'dribble-arrow':
      return { text: 'DRIBBLE', icon: '🌀' };
    case 'curved-arrow':
      return { text: 'OVERLAP', icon: '↷' };
    case 'cover-arrow':
      return { text: 'COVER', icon: '🛡️' };
    default:
      return null;
  }
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
  showActionLabels = true,
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
      // 2-point tools
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
    const isHovered = hoveredAnnotationId === ann.id;

    const commonProps = {
      className: `transition-all duration-150 ${
        isEraserTarget
          ? 'opacity-40 stroke-rose-400 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] cursor-pointer'
          : isHovered
          ? 'opacity-100 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
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

    // Calculate badge position and content
    const badgeInfo = getActionBadgeInfo(ann.tool);
    const displayText = ann.label || (showActionLabels && badgeInfo ? `${badgeInfo.icon} ${badgeInfo.text}` : null);

    const renderActionBadge = (midX: number, midY: number) => {
      if (!displayText && !isHovered) return null;
      const textToShow = displayText || (badgeInfo ? `${badgeInfo.icon} ${badgeInfo.text}` : '');
      if (!textToShow) return null;

      const charWidth = 1.35;
      const badgeWidth = Math.max(7, textToShow.length * charWidth + 2.4);
      const badgeHeight = 3.6;

      return (
        <g className="pointer-events-none select-none">
          <rect
            x={midX - badgeWidth / 2}
            y={midY - badgeHeight / 2}
            width={badgeWidth}
            height={badgeHeight}
            rx={1.2}
            ry={1.2}
            fill="#090c12"
            fillOpacity={0.92}
            stroke={stroke}
            strokeWidth={0.4}
            className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
          />
          <text
            x={midX}
            y={midY}
            fill={stroke}
            fontSize="2.1"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
            letterSpacing="0.04em"
          >
            {textToShow}
          </text>
        </g>
      );
    };

    switch (ann.tool) {
      case 'pen': {
        if (pts.length < 2) return null;
        const d = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`, '');
        return (
          <path
            key={ann.id}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...commonProps}
          />
        );
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
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            {...commonProps}
          />
        );
      }

      // ATTACKING RUN: Solid dynamic line with solid arrowhead
      case 'arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        return (
          <g key={ann.id} {...commonProps}>
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
            {dist > 9 && renderActionBadge(midX, midY)}
          </g>
        );
      }

      // PASS LANE: Distinct wide gaps in the middle + ball indicator at origin
      case 'dashed-arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        const ballRadius = Math.max(1.3, strokeWidth * 0.55);

        return (
          <g key={ann.id} {...commonProps}>
            {/* Origin Ball Marker */}
            <circle
              cx={p1.x}
              cy={p1.y}
              r={ballRadius}
              fill="#090c12"
              stroke={stroke}
              strokeWidth={Math.max(0.6, strokeWidth * 0.28)}
            />
            <circle
              cx={p1.x}
              cy={p1.y}
              r={ballRadius * 0.45}
              fill={stroke}
            />

            {/* Passing shaft with prominent wide gaps */}
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray="5.5 4.5"
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
            {dist > 9 && renderActionBadge(midX, midY)}
          </g>
        );
      }

      // PRESSING TRIGGER: Aggressive zig-zag sawtooth shaft + double-chevron arrowhead
      case 'press-arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath, secondChevronPath } = computeDoubleChevronGeometry(p1, p2, aspectRatio, strokeWidth);
        const zigzagPath = computeZigzagPath(p1, shaftEnd, aspectRatio, strokeWidth);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        return (
          <g key={ann.id} {...commonProps}>
            {/* Jagged / Sawtooth Pressing Shaft */}
            <path
              d={zigzagPath}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 1.15}
              strokeLinecap="round"
              strokeLinejoin="miter"
            />
            {/* Primary Arrowhead */}
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
            {/* Secondary Chevron (>> Double Chevron) */}
            {secondChevronPath && (
              <path
                d={secondChevronPath}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth * 1.05}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {dist > 8 && renderActionBadge(midX, midY)}
          </g>
        );
      }

      // DRIBBLE / BALL CARRY: Smooth undulating sinusoidal wave + ball start
      case 'dribble-arrow': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);
        const wavyPath = computeWavyPath(p1, shaftEnd, aspectRatio, strokeWidth);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        const ballRadius = Math.max(1.1, strokeWidth * 0.45);

        return (
          <g key={ann.id} {...commonProps}>
            {/* Ball Marker at Dribble Start */}
            <circle
              cx={p1.x}
              cy={p1.y}
              r={ballRadius}
              fill="#090c12"
              stroke={stroke}
              strokeWidth={Math.max(0.5, strokeWidth * 0.25)}
            />
            <circle cx={p1.x} cy={p1.y} r={ballRadius * 0.4} fill={stroke} />

            {/* Wavy Dribble Path */}
            <path
              d={wavyPath}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
            {dist > 9 && renderActionBadge(midX, midY)}
          </g>
        );
      }

      // CURVED / OVERLAPPING RUN: Arced quadratic curve
      case 'curved-arrow': {
        if (pts.length < 2) return null;
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const ctrl = pts.length === 3 ? pts[1] : { x: (p1.x + p2.x) / 2 - 8, y: (p1.y + p2.y) / 2 - 8 };
        const { shaftEnd, arrowheadPath } = computeCurvedArrowGeometry(p1, ctrl, p2, aspectRatio, strokeWidth);
        const d = `M ${p1.x} ${p1.y} Q ${ctrl.x} ${ctrl.y} ${shaftEnd.x} ${shaftEnd.y}`;

        // Bezier midpoint at t=0.5: 0.25*p1 + 0.5*ctrl + 0.25*p2
        const midX = 0.25 * p1.x + 0.5 * ctrl.x + 0.25 * p2.x;
        const midY = 0.25 * p1.y + 0.5 * ctrl.y + 0.25 * p2.y;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        return (
          <g key={ann.id} {...commonProps}>
            <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
            {dist > 9 && renderActionBadge(midX, midY)}
          </g>
        );
      }

      // DEFENSIVE COVER / RECOVERY RUN: Dot-dashed pattern (dash-dot-dash)
      case 'cover-arrow':
      case 'movement': {
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const { shaftEnd, arrowheadPath } = computeArrowGeometry(p1, p2, aspectRatio, strokeWidth);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        return (
          <g key={ann.id} {...commonProps}>
            {/* Defensive Anchor bar at start */}
            <circle
              cx={p1.x}
              cy={p1.y}
              r={Math.max(0.8, strokeWidth * 0.35)}
              fill={stroke}
            />
            <line
              x1={p1.x}
              y1={p1.y}
              x2={shaftEnd.x}
              y2={shaftEnd.y}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray="6.5 3 1.8 3"
              strokeLinecap="round"
            />
            {arrowheadPath && <path d={arrowheadPath} fill={stroke} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />}
            {dist > 9 && renderActionBadge(midX, midY)}
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
            stroke={stroke}
            strokeWidth={strokeWidth}
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
            stroke={stroke}
            strokeWidth={strokeWidth}
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
