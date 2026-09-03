import React from 'react';
import { Player, PositionCode } from '../types';
import { Plus, Star, Check } from 'lucide-react';
import { CATEGORY_COLORS } from '../data/players';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  onAddToPitch: (player: Player) => void;
  onAddToBench: (player: Player) => void;
  onEditCustomPlayer?: (player: Player) => void;
  onDeleteCustomPlayer?: (id: string) => void;
  isAlreadyOnPitch: boolean;
  isAlreadyOnBench: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onAddToPitch,
  onAddToBench,
  onEditCustomPlayer,
  onDeleteCustomPlayer,
  isAlreadyOnPitch,
  isAlreadyOnBench,
}) => {
  const catColor = CATEGORY_COLORS[player.category] || CATEGORY_COLORS.MID;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(player));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const statSummary = player.stats
    ? player.category === 'GK'
      ? `${player.stats.cleanSheets ?? 0} Clean Sheets`
      : `${player.stats.goals ?? 0}G, ${player.stats.assists ?? 0}A`
    : '';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative bg-[#11141a] hover:bg-[#181c25] border rounded-xl px-3 py-2.5 transition-all flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing shrink-0 min-h-[64px] ${
        isAlreadyOnPitch
          ? 'border-emerald-500/50 bg-emerald-950/20'
          : isAlreadyOnBench
          ? 'border-amber-500/50 bg-amber-950/20'
          : 'border-[#222834] hover:border-[#333c4f]'
      }`}
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
        {/* Avatar with rating badge */}
        <div className="flex-shrink-0">
          <PlayerAvatar player={player} size="md" showNumberBadge />
        </div>

        {/* Text details */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
              {player.shortName || player.name}
            </span>
            {player.isCustom && (
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] px-1 py-0.2 rounded font-mono shrink-0">
                Custom
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden"
            title={`${player.name} (${player.position}) • ${player.club}${statSummary ? ` • ${statSummary}` : ''}`}
          >
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${catColor.bg} ${catColor.text} border ${catColor.border}`}>
              {player.position}
            </span>
            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 fill-emerald-400" />
              {player.rating}
            </span>
            <span className="text-slate-600 shrink-0">•</span>
            <span className="truncate text-slate-400 text-[11px]">
              {player.club}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onAddToPitch(player)}
          title={isAlreadyOnPitch ? 'Already in Starting XI' : 'Add to Starting XI'}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-sm ${
            isAlreadyOnPitch
              ? 'bg-[#102a20] border-emerald-500/70 text-emerald-300 hover:bg-[#143428]'
              : 'bg-[#181c24] hover:bg-emerald-600 border-[#262c38] hover:border-emerald-500 text-slate-200 hover:text-white'
          }`}
        >
          {isAlreadyOnPitch ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pitch</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Pitch</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onAddToBench(player)}
          title={isAlreadyOnBench ? 'Already on Bench' : 'Add to Bench'}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-sm ${
            isAlreadyOnBench
              ? 'bg-[#2a2210] border-amber-500/70 text-amber-300 hover:bg-[#342a14]'
              : 'bg-[#181c24] hover:bg-amber-600 border-[#262c38] hover:border-amber-500 text-slate-200 hover:text-white'
          }`}
        >
          {isAlreadyOnBench ? (
            <>
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Bench</span>
            </>
          ) : (
            <span>Bench</span>
          )}
        </button>

        {player.isCustom && onEditCustomPlayer && (
          <button
            type="button"
            onClick={() => onEditCustomPlayer(player)}
            title="Edit Custom Player"
            className="px-2 py-1.5 rounded-lg border border-[#262c38] bg-[#181c24] hover:bg-purple-600 text-slate-300 hover:text-white text-xs cursor-pointer shadow-sm"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
