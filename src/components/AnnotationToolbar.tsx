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
  Minus,
  Sparkles,
  Footprints,
  Zap
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
}

const PALETTE = [
  { label: 'Tactical Yellow', value: '#facc15' },
  { label: 'Electric Sky', value: '#38bdf8' },
  { label: 'Vibrant Orange', value: '#fb923c' },
  { label: 'Crimson Press', value: '#f43f5e' },
  { label: 'Pitch White', value: '#ffffff' },
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
}) => {
  const tools = [
    { id: 'curved-arrow' as AnnotationTool, label: 'Curved Run', icon: Footprints },
    { id: 'arrow' as AnnotationTool, label: 'Attack Run', icon: ArrowRight },
    { id: 'dashed-arrow' as AnnotationTool, label: 'Pass Lane', icon: Split },
    { id: 'press-arrow' as AnnotationTool, label: 'Pressing', icon: Zap },
    { id: 'pen' as AnnotationTool, label: 'Freehand', icon: Pencil },
    { id: 'movement' as AnnotationTool, label: 'Movement', icon: Minus },
    { id: 'circle' as AnnotationTool, label: 'Circle Zone', icon: CircleIcon },
    { id: 'rect' as AnnotationTool, label: 'Zonal Box', icon: Square },
    { id: 'highlight' as AnnotationTool, label: 'Highlight', icon: Sparkles },
    { id: 'text' as AnnotationTool, label: 'Text Tag', icon: Type },
    { id: 'eraser' as AnnotationTool, label: 'Eraser', icon: Eraser },
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

      {/* Tools Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>Tactical Tools</span>
          {annotationCount > 0 && (
            <span className="bg-[#1e232d] text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#262c38]">
              {annotationCount} active
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {tools.map((t) => {
            const Icon = t.icon;
            const isSelected = isDrawingMode && currentTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onToggleDrawingMode(true);
                  onSelectTool(t.id);
                }}
                title={t.label}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-[#0e1015] border-[#222834] text-slate-300 hover:bg-[#1c202a] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px] truncate max-w-full leading-none">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors & Widths */}
      <div className="flex flex-col gap-2 pt-1 border-t border-[#222834]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Color & Stroke</span>
          <div className="flex items-center gap-1 bg-[#0e1015] p-0.5 rounded-lg border border-[#222834]">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                type="button"
                onClick={() => onChangeStrokeWidth(sw.value)}
                title={`${sw.label} line width`}
                className={`p-1.5 rounded transition-all flex items-center justify-center ${
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
              className={`w-6 h-6 rounded-full transition-transform border ${
                currentColor === c.value
                  ? 'scale-110 border-white ring-2 ring-emerald-500/50'
                  : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Action Controls: Undo, Redo, Clear */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-[#222834]">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last annotation (Ctrl+Z)"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border text-xs transition-all ${
            canUndo
              ? 'bg-[#181c24] border-[#262c38] text-slate-200 hover:bg-[#202530] hover:text-white'
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
              ? 'bg-[#181c24] border-[#262c38] text-slate-200 hover:bg-[#202530] hover:text-white'
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
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'
              : 'bg-[#0e1015] border-[#1a1e27] text-slate-600 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
