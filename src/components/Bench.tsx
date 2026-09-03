import React, { useState } from 'react';
import { PitchPlayer, LineupDisplaySettings } from '../types';
import { ArrowUpRight, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { CATEGORY_COLORS } from '../data/players';
import { PlayerAvatar } from './PlayerAvatar';

interface BenchProps {
  benchPlayers: PitchPlayer[];
  selectedPlayerId: string | null;
  onSelectPlayer: (instanceId: string | null) => void;
  onRemoveFromBench: (instanceId: string) => void;
  onMoveToPitch: (instanceId: string) => void;
  onSwapWithPitchPlayer?: (benchInstanceId: string) => void;
  displaySettings: LineupDisplaySettings;
}

export const Bench: React.FC<BenchProps> = ({
  benchPlayers,
  selectedPlayerId,
  onSelectPlayer,
  onRemoveFromBench,
  onMoveToPitch,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDragStart = (e: React.DragEvent, bp: PitchPlayer) => {
    e.dataTransfer.setData('application/json', JSON.stringify(bp.player));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-[#14171f]/95 border border-[#222834] rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md transition-all">
      {/* Bench Header / Compact Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Substitutes / Bench</span>
            <span className="bg-[#1e232d] text-amber-400 font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-[#262c38]">
              {benchPlayers.length}
            </span>
            {isCollapsed ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {isCollapsed ? 'Click to expand bench' : 'Drag or click to sub onto pitch'}
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-[#1b202a] hover:bg-[#252c3a] border border-[#262c38]"
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {/* Bench Players Horizontal Scroll / Grid */}
      {!isCollapsed && (
        <div className="mt-1.5 pt-1.5 border-t border-[#1e232d]">
          {benchPlayers.length > 0 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
              {benchPlayers.map((bp) => {
                const isSelected = selectedPlayerId === bp.instanceId;
                const category = bp.player.category || 'MID';
                const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.MID;

                return (
                  <div
                    key={bp.instanceId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, bp)}
                    onClick={() => onSelectPlayer(bp.instanceId)}
                    className={`flex-shrink-0 group relative bg-[#0c0e12] hover:bg-[#161a22] border rounded-lg p-1.5 transition-all flex items-center gap-2 w-44 cursor-pointer select-none ${
                      isSelected
                        ? 'ring-2 ring-amber-400 border-amber-400 shadow-md'
                        : 'border-[#222834] hover:border-[#333b4d]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <PlayerAvatar player={{ ...bp.player, shirtNumber: bp.shirtNumber }} size="sm" showNumberBadge />
                    </div>

                    {/* Name & Position */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-100 truncate leading-tight">
                        {bp.player.shortName || bp.player.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[8px] font-black uppercase px-1 rounded ${catColor.bg} ${catColor.text}`}>
                          {bp.player.position}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400">
                          {bp.player.rating}
                        </span>
                      </div>
                    </div>

                    {/* Quick Sub Action */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToPitch(bp.instanceId);
                        }}
                        title="Sub onto pitch"
                        className="p-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[9px] font-bold transition-all"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromBench(bp.instanceId);
                        }}
                        title="Remove from bench"
                        className="p-1 rounded bg-[#181c24] hover:bg-rose-600/80 text-slate-400 hover:text-white border border-[#262c38] text-[9px] transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2 text-slate-500 text-xs">
              No substitutes added. Click "+ Bench" on any player in the search panel.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
