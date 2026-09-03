import React from 'react';
import { Lineup } from '../types';
import { Play, Copy, Share2, Trash2, Calendar, Users, Shield, ArrowRight } from 'lucide-react';

interface LineupCardProps {
  lineup: Lineup;
  onEdit: (lineup: Lineup) => void;
  onDuplicate: (id: string) => void;
  onShare: (lineup: Lineup) => void;
  onDelete: (id: string) => void;
}

export const LineupCard: React.FC<LineupCardProps> = ({
  lineup,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
}) => {
  const formattedDate = new Date(lineup.updatedAt || lineup.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px]">
      {/* Top Details & Mini Pitch Preview */}
      <div className="flex gap-4">
        {/* Mini Tactical Pitch Preview */}
        <div
          onClick={() => onEdit(lineup)}
          className="w-24 h-32 bg-emerald-950/80 rounded-xl border border-emerald-800/40 relative overflow-hidden flex-shrink-0 cursor-pointer shadow-inner group-hover:border-emerald-500/50 transition-colors"
        >
          {/* Halfway line & center circle */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-emerald-700/30" />
          <div className="w-6 h-6 rounded-full border border-emerald-700/30 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          {/* Player dots */}
          {lineup.players.map((p) => (
            <div
              key={p.instanceId}
              className={`absolute w-2 h-2 rounded-full shadow-sm ${
                p.player.position === 'GK' ? 'bg-amber-400' : 'bg-white'
              }`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                {lineup.formationId.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <h3
              onClick={() => onEdit(lineup)}
              className="text-sm font-bold text-slate-100 truncate group-hover:text-emerald-400 cursor-pointer transition-colors"
            >
              {lineup.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {lineup.teamName || 'Custom XI'} {lineup.opponentName ? `vs ${lineup.opponentName}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{lineup.players.length} on Pitch</span>
            </span>
            {lineup.bench.length > 0 && (
              <span className="text-amber-400 font-medium">+{lineup.bench.length} Subs</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => onEdit(lineup)}
          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Open Tactics</span>
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(lineup.id)}
          title="Duplicate Lineup"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onShare(lineup)}
          title="Share Lineup"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(lineup.id)}
          title="Delete Lineup"
          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 border border-slate-700 text-slate-400 hover:text-white text-xs transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
