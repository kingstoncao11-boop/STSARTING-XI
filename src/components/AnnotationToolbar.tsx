import React from 'react';
import {
  Pencil,
  ArrowRight,
  Split,
  Circle as CircleIcon,
  Square,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  MousePointer2,
  Sparkles,
  Footprints,
  Zap,
  Waves,
  Shield,
  Tag
} from 'lucide-react';
import { AnnotationTool } from '../types';

interface AnnotationToolbarProps {
  currentTool: AnnotationTool;
  onSelectTool: (tool: AnnotationTool) => void;
  currentColor: string;
  onChangeColor: (color: string) => void;
  currentStrokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: (mode: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  annotationCount: number;
  showActionLabels?: boolean;
  onToggleActionLabels?: (show: boolean) => void;
}

export interface TacticalActionItem {
  id: AnnotationTool;
  name: string;
  shortLabel: string;
  description: string;
  defaultColor: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  visualStyle: 'solid' | 'dashed-wide' | 'zigzag' | 'wavy' | 'curved' | 'dot-dash';
}

export const TACTICAL_ACTIONS: TacticalActionItem[] = [
  {
    id: 'dashed-arrow',
    name: 'Pass Lane',
    shortLabel: 'Pass',
    description: 'Ball delivery with wide-gap dashes & origin ball marker',
    defaultColor: '#facc15',
    icon: Split,
    badge: '⚽ Wide Gaps',
    visualStyle: 'dashed-wide',
  },
  {
    id: 'press-arrow',
    name: 'Pressing Trigger',
    shortLabel: 'Pressing',
    description: 'High defensive pressure with sharp zig-zag & double chevrons',
    defaultColor: '#f43f5e',
    icon: Zap,
    badge: '⚡ Zig-Zag',
    visualStyle: 'zigzag',
  },
  {
    id: 'arrow',
    name: 'Attacking Run',
    shortLabel: 'Run',
    description: 'Direct off-the-ball sprint into space or behind defence',
    defaultColor: '#ffffff',
    icon: ArrowRight,
    badge: '🏃 Solid',
    visualStyle: 'solid',
  },
  {
    id: 'dribble-arrow',
    name: 'Dribble / Carry',
    shortLabel: 'Dribble',
    description: 'Driving forward with the ball in sinusoidal wavy motion',
    defaultColor: '#38bdf8',
    icon: Waves,
    badge: '🌀 Wavy',
    visualStyle: 'wavy',
  },
  {
    id: 'curved-arrow',
    name: 'Curved Overlap',
    shortLabel: 'Overlap',
    description: 'Bending run around defenders or overlapping fullback',
    defaultColor: '#fb923c',
    icon: Footprints,
    badge: '↷ Arc',
    visualStyle: 'curved',
  },
  {
    id: 'cover-arrow',
    name: 'Defensive Cover',
    shortLabel: 'Cover',
    description: 'Tracking back, covering space & defensive balance',
    defaultColor: '#60a5fa',
    icon: Shield,
    badge: '🛡️ Dot-Dash',
    visualStyle: 'dot-dash',
  },
];

const PALETTE = [
  { label: 'Tactical Yellow (Passing)', value: '#facc15' },
  { label: 'Crimson Press (Pressing)', value: '#f43f5e' },
  { label: 'Electric Sky (Dribble)', value: '#38bdf8' },
  { label: 'Vibrant Orange (Overlap)', value: '#fb923c' },
  { label: 'Pitch White (Direct Run)', value: '#ffffff' },
  { label: 'Defensive Blue (Cover)', value: '#60a5fa' },
  { label: 'Neon Emerald', value: '#34d399' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 1.5, size: 'w-1.5 h-1.5' },
  { label: 'Medium', value: 2.8, size: 'w-2.5 h-2.5' },
  { label: 'Thick', value: 4.5, size: 'w-3.5 h-3.5' },
];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  currentTool,
  onSelectTool,
  currentColor,
  onChangeColor,
  currentStrokeWidth,
  onChangeStrokeWidth,
  isDrawingMode,
  onToggleDrawingMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  annotationCount,
  showActionLabels = true,
  onToggleActionLabels,
}) => {
  const handleSelectAction = (action: TacticalActionItem) => {
    onToggleDrawingMode(true);
    onSelectTool(action.id);
    onChangeColor(action.defaultColor);
  };

  const zonalTools = [
    { id: 'rect' as AnnotationTool, label: 'Zonal Box', icon: Square, desc: 'Half-spaces / boxes' },
    { id: 'circle' as AnnotationTool, label: 'Circle Zone', icon: CircleIcon, desc: 'Pressing pocket' },
    { id: 'highlight' as AnnotationTool, label: 'Spotlight', icon: Sparkles, desc: 'Player glow' },
    { id: 'pen' as AnnotationTool, label: 'Freehand', icon: Pencil, desc: 'Free sketch' },
    { id: 'text' as AnnotationTool, label: 'Text Tag', icon: Type, desc: 'Custom coach note' },
    { id: 'eraser' as AnnotationTool, label: 'Eraser', icon: Eraser, desc: 'Click arrow to delete' },
  ];

  return (
    <div className="bg-[#14171f] border border-[#222834] rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-[#222834] pb-2.5">
        <div className="flex items-center gap-1 bg-[#0e1015] p-1 rounded-xl border border-[#222834] w-full">
          <button
            type="button"
            onClick={() => onToggleDrawingMode(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              !isDrawingMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Move & Drag Players (V)"
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span>Move Players</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleDrawingMode(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              isDrawingMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Draw Tactical Annotations (D)"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Draw Tactics</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Tactical Player Actions (Arrows with distinct styles and colors) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Player Action Arrows</span>
          </span>
          {annotationCount > 0 && (
            <span className="bg-[#1e232d] text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#262c38]">
              {annotationCount} drawn
            </span>
          )}
        </div>

        {/* Action Buttons Grid with Distinct Styles & Visual Differentiation */}
        <div className="grid grid-cols-2 gap-1.5">
          {TACTICAL_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isSelected = isDrawingMode && currentTool === action.id;

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleSelectAction(action)}
                title={`${action.name} - ${action.description}`}
                className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-[#1a2130] border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-[#0d1016] border-[#222834] hover:bg-[#161a24] hover:border-[#2f384a]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: action.defaultColor }}
                    />
                    <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {action.shortLabel}
                    </span>
                  </div>
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                </div>

                {/* Visual miniature representation of arrow style */}
                <div className="flex items-center justify-between w-full mt-0.5">
                  <span className="text-[9px] font-mono text-slate-400 leading-tight truncate">
                    {action.badge}
                  </span>
                  <div className="w-10 h-2 flex items-center justify-end">
                    {action.visualStyle === 'dashed-wide' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <circle cx="4" cy="4" r="2.5" fill="none" stroke={action.defaultColor} strokeWidth="1" />
                        <circle cx="4" cy="4" r="1" fill={action.defaultColor} />
                        <line x1="8" y1="4" x2="32" y2="4" stroke={action.defaultColor} strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" />
                        <polygon points="32,1 38,4 32,7" fill={action.defaultColor} />
                      </svg>
                    )}
                    {action.visualStyle === 'zigzag' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <path d="M 2 4 L 7 1 L 12 7 L 17 1 L 22 7 L 27 1 L 31 4" fill="none" stroke={action.defaultColor} strokeWidth="1.6" strokeLinecap="round" />
                        <polygon points="31,1 37,4 31,7" fill={action.defaultColor} />
                        <polyline points="26,1 31,4 26,7" fill="none" stroke={action.defaultColor} strokeWidth="1.2" />
                      </svg>
                    )}
                    {action.visualStyle === 'solid' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <line x1="2" y1="4" x2="32" y2="4" stroke={action.defaultColor} strokeWidth="2" strokeLinecap="round" />
                        <polygon points="32,1 38,4 32,7" fill={action.defaultColor} />
                      </svg>
                    )}
                    {action.visualStyle === 'wavy' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <path d="M 2 4 Q 8 0 14 4 T 26 4 L 31 4" fill="none" stroke={action.defaultColor} strokeWidth="1.8" strokeLinecap="round" />
                        <polygon points="31,1 38,4 31,7" fill={action.defaultColor} />
                      </svg>
                    )}
                    {action.visualStyle === 'curved' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <path d="M 2 7 Q 16 1 31 4" fill="none" stroke={action.defaultColor} strokeWidth="1.8" strokeLinecap="round" />
                        <polygon points="31,1 38,4 31,7" fill={action.defaultColor} />
                      </svg>
                    )}
                    {action.visualStyle === 'dot-dash' && (
                      <svg className="w-10 h-2" viewBox="0 0 40 8">
                        <circle cx="3" cy="4" r="1.5" fill={action.defaultColor} />
                        <line x1="6" y1="4" x2="32" y2="4" stroke={action.defaultColor} strokeWidth="1.8" strokeDasharray="6 2.5 1.5 2.5" strokeLinecap="round" />
                        <polygon points="32,1 38,4 32,7" fill={action.defaultColor} />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Pitch Zones, Freehand & Tools */}
      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#222834]">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Pitch Zones & Markings
        </span>
        <div className="grid grid-cols-6 gap-1">
          {zonalTools.map((zt) => {
            const Icon = zt.icon;
            const isSelected = isDrawingMode && currentTool === zt.id;
            return (
              <button
                key={zt.id}
                type="button"
                onClick={() => {
                  onToggleDrawingMode(true);
                  onSelectTool(zt.id);
                }}
                title={`${zt.label} (${zt.desc})`}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? zt.id === 'eraser'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                      : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#0e1015] border-[#222834] text-slate-300 hover:bg-[#1a1e27] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[8px] truncate leading-none">{zt.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Action Labels on Pitch Toggle */}
      {onToggleActionLabels && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#0e1015] border border-[#222834]">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Show Action Tags on Pitch</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleActionLabels(!showActionLabels)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
              showActionLabels
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#181c24] text-slate-400 border-[#2b3344] hover:text-slate-200'
            }`}
          >
            {showActionLabels ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* SECTION 4: Colors & Stroke Widths */}
      <div className="flex flex-col gap-2 pt-1 border-t border-[#222834]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Custom Color & Stroke</span>
          <div className="flex items-center gap-1 bg-[#0e1015] p-0.5 rounded-lg border border-[#222834]">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                type="button"
                onClick={() => onChangeStrokeWidth(sw.value)}
                title={`${sw.label} line width`}
                className={`p-1.5 rounded transition-all flex items-center justify-center cursor-pointer ${
                  currentStrokeWidth === sw.value
                    ? 'bg-[#1e232d] text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className={`${sw.size} rounded-full inline-block`}
                  style={{ backgroundColor: currentColor }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex items-center justify-between gap-1 bg-[#0e1015] p-1.5 rounded-xl border border-[#222834]">
          {PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChangeColor(c.value)}
              title={c.label}
              className={`w-5 h-5 rounded-full transition-transform border cursor-pointer ${
                currentColor === c.value
                  ? 'scale-125 border-white ring-2 ring-emerald-500/50'
                  : 'border-transparent hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* SECTION 5: Action Controls: Undo, Redo, Clear */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-[#222834]">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last annotation (Ctrl+Z)"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border text-xs transition-all ${
            canUndo
              ? 'bg-[#181c24] border-[#262c38] text-slate-200 hover:bg-[#202530] hover:text-white cursor-pointer'
              : 'bg-[#0e1015] border-[#1a1e27] text-slate-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Undo</span>
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo annotation (Ctrl+Y)"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border text-xs transition-all ${
            canRedo
              ? 'bg-[#181c24] border-[#262c38] text-slate-200 hover:bg-[#202530] hover:text-white cursor-pointer'
              : 'bg-[#0e1015] border-[#1a1e27] text-slate-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Redo</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={annotationCount === 0}
          title="Clear all annotations"
          className={`flex items-center justify-center p-2 rounded-xl border text-xs transition-all ${
            annotationCount > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer'
              : 'bg-[#0e1015] border-[#1a1e27] text-slate-600 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
