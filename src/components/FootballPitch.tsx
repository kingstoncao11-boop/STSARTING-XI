import React, { useRef, useState, useEffect } from 'react';
import { PitchPlayer, LineupDisplaySettings, Annotation, AnnotationTool } from '../types';
import { PlayerMarker } from './PlayerMarker';
import { AnnotationCanvas } from './AnnotationCanvas';

interface FootballPitchProps {
  players: PitchPlayer[];
  selectedPlayerId: string | null;
  onSelectPlayer: (instanceId: string | null) => void;
  onUpdatePlayerPosition: (instanceId: string, x: number, y: number) => void;
  onPlayerDrop?: (playerData: any, x: number, y: number) => void;
  annotations: Annotation[];
  annotationTool: AnnotationTool;
  annotationColor: string;
  annotationStrokeWidth: number;
  isDrawingMode: boolean;
  onAddAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  displaySettings: LineupDisplaySettings;
}

export const FootballPitch: React.FC<FootballPitchProps> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onUpdatePlayerPosition,
  onPlayerDrop,
  annotations,
  annotationTool,
  annotationColor,
  annotationStrokeWidth,
  isDrawingMode,
  onAddAnnotation,
  onDeleteAnnotation,
  displaySettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pitchContainerRef = useRef<HTMLDivElement>(null);
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [pitchSize, setPitchSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Update pitch dimensions dynamically to fit 100% of available viewport without overflow
  useEffect(() => {
    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const availWidth = rect.width;
      const availHeight = rect.height;

      if (availWidth <= 0 || availHeight <= 0) return;

      const PITCH_ASPECT_RATIO = 680 / 1000; // FIFA standard pitch proportions: 0.68
      const availRatio = availWidth / availHeight;

      let w = 0;
      let h = 0;

      if (availRatio > PITCH_ASPECT_RATIO) {
        // Container is wider than pitch -> fit available height (minus small margin for border)
        h = Math.floor(availHeight);
        w = Math.floor(h * PITCH_ASPECT_RATIO);
        if (w > availWidth) {
          w = Math.floor(availWidth);
          h = Math.floor(w / PITCH_ASPECT_RATIO);
        }
      } else {
        // Container is narrower than pitch -> fit available width
        w = Math.floor(availWidth);
        h = Math.floor(w / PITCH_ASPECT_RATIO);
        if (h > availHeight) {
          h = Math.floor(availHeight);
          w = Math.floor(h * PITCH_ASPECT_RATIO);
        }
      }

      setPitchSize({ width: w, height: h });
    };

    updateDimensions();

    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => {
        updateDimensions();
      });
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateDimensions);
    document.addEventListener('fullscreenchange', updateDimensions);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateDimensions);
      document.removeEventListener('fullscreenchange', updateDimensions);
    };
  }, []);

  const handlePointerDownPlayer = (instanceId: string, e: React.PointerEvent) => {
    if (isDrawingMode) return; // Don't drag while drawing
    e.stopPropagation();
    e.preventDefault();

    onSelectPlayer(instanceId);
    setDraggingPlayerId(instanceId);

    const pitch = pitchContainerRef.current;
    if (!pitch) return;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = pitch.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const rawX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const rawY = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      // Clamp so players stay within playable pitch boundaries
      let clampedX = Math.max(5, Math.min(95, Math.round(rawX * 10) / 10));
      let clampedY = Math.max(5, Math.min(95, Math.round(rawY * 10) / 10));

      // Snap-to-formation option
      if (displaySettings.snapToFormation) {
        const currentPl = players.find((p) => p.instanceId === instanceId);
        if (currentPl && currentPl.originX !== undefined && currentPl.originY !== undefined) {
          const distToOrigin = Math.hypot(clampedX - currentPl.originX, clampedY - currentPl.originY);
          if (distToOrigin < 4) {
            clampedX = currentPl.originX;
            clampedY = currentPl.originY;
          }
        }
      }

      onUpdatePlayerPosition(instanceId, clampedX, clampedY);
    };

    const handlePointerUp = () => {
      setDraggingPlayerId(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePitchClick = (e: React.MouseEvent) => {
    if (isDrawingMode) return;
    // Clicked empty pitch space -> deselect
    onSelectPlayer(null);
  };

  // Drag and drop from external search or bench
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!pitchContainerRef.current || !onPlayerDrop) return;
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const playerData = JSON.parse(rawData);
      const rect = pitchContainerRef.current.getBoundingClientRect();
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      onPlayerDrop(playerData, x, y);
    } catch (err) {
      console.error('Failed to parse dropped player data', err);
    }
  };

  // Pitch Theme Styling
  const getThemeClasses = () => {
    switch (displaySettings.pitchTheme) {
      case 'classic':
        return 'bg-[#15803d] border-[#166534]';
      case 'night':
        return 'bg-[#0b1c14] border-[#123624]';
      case 'tactical-board':
        return 'bg-[#071710] border-[#0c2e1c]';
      case 'slate':
        return 'bg-[#10131a] border-[#222834]';
      case 'emerald':
      default:
        return 'pitch-stripes-horizontal border-[#143d26]';
    }
  };

  const lineColor = displaySettings.pitchTheme === 'slate' ? 'rgba(148, 163, 184, 0.45)' : 'rgba(255, 255, 255, 0.7)';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden p-0 select-none"
    >
      {/* Pitch Frame Container with auto-scaled geometry */}
      <div
        id="tactics-pitch-canvas"
        ref={pitchContainerRef}
        className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 transition-colors flex-shrink-0 ${getThemeClasses()}`}
        onClick={handlePitchClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: pitchSize.width > 0 ? `${pitchSize.width}px` : 'auto',
          height: pitchSize.height > 0 ? `${pitchSize.height}px` : '100%',
          aspectRatio: '680 / 1000',
          maxHeight: '100%',
          maxWidth: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Pitch Subtle Grass Texture Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Pitch SVG Markings (Proportions strictly modeled on standard FIFA pitch geometry) */}
        <svg
          viewBox="0 0 680 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          {/* Pitch Outer Boundary Line */}
          <rect
            x="30"
            y="30"
            width="620"
            height="940"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />

          {/* Halfway Line */}
          <line
            x1="30"
            y1="500"
            x2="650"
            y2="500"
            stroke={lineColor}
            strokeWidth="3.5"
          />

          {/* Center Circle (Radius 9.15m scaled) */}
          <circle
            cx="340"
            cy="500"
            r="91.5"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />

          {/* Center Spot */}
          <circle cx="340" cy="500" r="4.5" fill={lineColor} />

          {/* TOP / OPPONENT PENALTY AREA */}
          {/* 18-Yard Penalty Box */}
          <rect
            x="138.8"
            y="30"
            width="402.4"
            height="165"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* 6-Yard Goal Box */}
          <rect
            x="248.8"
            y="30"
            width="182.4"
            height="55"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* Penalty Spot (Top) */}
          <circle cx="340" cy="140" r="4" fill={lineColor} />
          {/* Penalty Arc / D-Box (Top) */}
          <path
            d="M 276.5 195 A 91.5 91.5 0 0 0 403.5 195"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* Goal Frame (Top) */}
          <rect
            x="293.4"
            y="12"
            width="93.2"
            height="18"
            fill="rgba(255,255,255,0.08)"
            stroke={lineColor}
            strokeWidth="2.5"
          />

          {/* BOTTOM / OWN PENALTY AREA */}
          {/* 18-Yard Penalty Box */}
          <rect
            x="138.8"
            y="805"
            width="402.4"
            height="165"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* 6-Yard Goal Box */}
          <rect
            x="248.8"
            y="915"
            width="182.4"
            height="55"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* Penalty Spot (Bottom) */}
          <circle cx="340" cy="860" r="4" fill={lineColor} />
          {/* Penalty Arc / D-Box (Bottom) */}
          <path
            d="M 276.5 805 A 91.5 91.5 0 0 1 403.5 805"
            fill="none"
            stroke={lineColor}
            strokeWidth="3.5"
          />
          {/* Goal Frame (Bottom) */}
          <rect
            x="293.4"
            y="970"
            width="93.2"
            height="18"
            fill="rgba(255,255,255,0.08)"
            stroke={lineColor}
            strokeWidth="2.5"
          />

          {/* Corner Arcs */}
          {/* Top Left */}
          <path d="M 30 50 A 20 20 0 0 1 50 30" fill="none" stroke={lineColor} strokeWidth="3" />
          {/* Top Right */}
          <path d="M 630 30 A 20 20 0 0 1 650 50" fill="none" stroke={lineColor} strokeWidth="3" />
          {/* Bottom Left */}
          <path d="M 30 950 A 20 20 0 0 0 50 970" fill="none" stroke={lineColor} strokeWidth="3" />
          {/* Bottom Right */}
          <path d="M 630 970 A 20 20 0 0 0 650 950" fill="none" stroke={lineColor} strokeWidth="3" />
        </svg>

        {/* Optional Tactical Grid Guide Lines */}
        {displaySettings.showGridLines && (
          <div className="absolute inset-x-[4.4%] inset-y-[3%] pointer-events-none opacity-10 border border-white/40 grid grid-cols-5 grid-rows-6" />
        )}

        {/* PLAYER TACTICAL MOVEMENT TRAILS (Shows original formation position to tactical displacement) */}
        {(displaySettings.showPlayerTrails ?? true) && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
          >
            {players.map((p) => {
              if (p.originX === undefined || p.originY === undefined) return null;
              const dist = Math.hypot(p.x - p.originX, p.y - p.originY);
              if (dist < 2.5) return null;

              return (
                <g key={`trail-${p.instanceId}`} className="opacity-75">
                  {/* Origin ghost ring */}
                  <circle
                    cx={p.originX}
                    cy={p.originY}
                    r={2}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={0.75}
                    strokeDasharray="1,1"
                  />
                  {/* Movement Vector */}
                  <line
                    x1={p.originX}
                    y1={p.originY}
                    x2={p.x}
                    y2={p.y}
                    stroke="#10b981"
                    strokeWidth={0.9}
                    strokeDasharray="2,1.5"
                    strokeLinecap="round"
                  />
                  {/* Small arrow marker at player location */}
                  <circle cx={p.x} cy={p.y} r={1} fill="#10b981" />
                </g>
              );
            })}
          </svg>
        )}

        {/* TACTICAL ANNOTATION LAYER (Vector Layer underneath players) */}
        <AnnotationCanvas
          annotations={annotations}
          currentTool={annotationTool}
          currentColor={annotationColor}
          currentStrokeWidth={annotationStrokeWidth}
          isDrawingMode={isDrawingMode}
          onAddAnnotation={onAddAnnotation}
          onDeleteAnnotation={onDeleteAnnotation}
          width={pitchSize.width > 0 ? pitchSize.width : 600}
          height={pitchSize.height > 0 ? pitchSize.height : 882}
        />

        {/* PLAYER MARKERS LAYER (Draggable on top of annotations) */}
        <div className={`absolute inset-0 pointer-events-auto ${isDrawingMode ? 'pointer-events-none' : ''}`}>
          {players.map((pitchPlayer) => (
            <PlayerMarker
              key={pitchPlayer.instanceId}
              pitchPlayer={pitchPlayer}
              isSelected={selectedPlayerId === pitchPlayer.instanceId}
              isDragging={draggingPlayerId === pitchPlayer.instanceId}
              displaySettings={displaySettings}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlayer(pitchPlayer.instanceId);
              }}
              onPointerDown={(e) => handlePointerDownPlayer(pitchPlayer.instanceId, e)}
            />
          ))}
        </div>

        {/* Empty Pitch State if No Players */}
        {players.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <div className="bg-[#0e1015]/90 backdrop-blur-md px-6 py-4 rounded-xl border border-[#222834] text-slate-300 max-w-xs shadow-xl">
              <p className="font-semibold text-sm text-emerald-400 mb-1">Empty Pitch</p>
              <p className="text-xs text-slate-400">
                Choose a formation from the left panel or click players in the search panel to populate your Starting XI.
              </p>
            </div>
          </div>
        )}

        {/* Pitch watermark indicator */}
        <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-black tracking-widest uppercase text-white/30">
          Starting XI
        </div>
      </div>
    </div>
  );
};
