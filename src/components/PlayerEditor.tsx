import React, { useState, useEffect } from 'react';
import { PitchPlayer, PositionCode, MarkerStyle } from '../types';
import {
  X,
  Award,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Shield,
  Star
} from 'lucide-react';
import { CATEGORY_COLORS, getCategoryFromPosition } from '../data/players';

export interface PlayerEditorProps {
  selectedPitchPlayer: PitchPlayer | null;
  allLineupPlayers: PitchPlayer[];
  isOnBench?: boolean;
  isDragging?: boolean;
  inSidebar?: boolean;
  onClose: () => void;
  onUpdatePlayer: (instanceId: string, updates: Partial<PitchPlayer>) => void;
  onMoveToBench: (instanceId: string) => void;
  onMoveBenchToPitch?: (instanceId: string) => void;
  onRemovePlayer: (instanceId: string) => void;
  onSetCaptain: (instanceId: string) => void;
}

const ALL_POSITIONS: PositionCode[] = [
  'GK',
  'CB',
  'LCB',
  'RCB',
  'LB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'LDM',
  'RDM',
  'CM',
  'LCM',
  'RCM',
  'CAM',
  'LAM',
  'RAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'CF',
  'ST',
];

export const PlayerEditor: React.FC<PlayerEditorProps> = ({
  selectedPitchPlayer,
  allLineupPlayers,
  isOnBench = false,
  isDragging = false,
  inSidebar = false,
  onClose,
  onUpdatePlayer,
  onMoveToBench,
  onMoveBenchToPitch,
  onRemovePlayer,
  onSetCaptain,
}) => {
  if (!selectedPitchPlayer) return null;

  const { player, shirtNumber, isCaptain, instanceId, roleNote, displayStyle } = selectedPitchPlayer;
  const [editedNumber, setEditedNumber] = useState(shirtNumber.toString());
  const [editedName, setEditedName] = useState(player.shortName || player.name);
  const [editedPosition, setEditedPosition] = useState<PositionCode>(player.position);
  const [editedRoleNote, setEditedRoleNote] = useState(roleNote || '');
  const [allowDuplicateNumber, setAllowDuplicateNumber] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setEditedNumber(shirtNumber.toString());
    setEditedName(player.shortName || player.name);
    setEditedPosition(player.position);
    setEditedRoleNote(roleNote || '');
  }, [selectedPitchPlayer]);

  // Check for duplicate shirt numbers in current lineup
  const parsedNumber = parseInt(editedNumber, 10);
  const isDuplicateNumber =
    !isNaN(parsedNumber) &&
    allLineupPlayers.some(
      (p) => p.instanceId !== instanceId && p.shirtNumber === parsedNumber
    );

  const category = getCategoryFromPosition(editedPosition);
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.MID;

  // =========================================================================
  // 1. SIDEBAR MODE (Desktop right column when docked)
  // =========================================================================
  if (inSidebar) {
    return (
      <div className="flex flex-col gap-3 p-3 bg-[#13161f] rounded-xl border border-[#222735] h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222735] pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#181c26] border border-[#2d3445] flex-shrink-0">
              <img
                src={player.avatar}
                alt={player.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span
                className="absolute bottom-0 right-0 px-1 text-[8px] font-black text-white rounded"
                style={{ backgroundColor: catColor }}
              >
                {editedPosition}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                <span>{player.name}</span>
                {isCaptain && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full">
                    (C)
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">{player.club} • #{shirtNumber} • Rating {player.rating}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Deselect Player"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetCaptain(instanceId)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
              isCaptain
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-[#181c26] border-[#262d3d] text-slate-200 hover:bg-amber-600 hover:text-white hover:border-amber-500'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{isCaptain ? 'Captain' : 'Make Captain'}</span>
          </button>

          {isOnBench ? (
            <button
              type="button"
              onClick={() => onMoveBenchToPitch && onMoveBenchToPitch(instanceId)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>To Pitch</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMoveToBench(instanceId)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#181c26] hover:bg-[#202535] border border-[#262d3d] text-slate-200 text-xs font-bold transition-all"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>To Bench</span>
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300">Shirt Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={editedNumber}
                onChange={(e) => {
                  setEditedNumber(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onUpdatePlayer(instanceId, { shirtNumber: val });
                  }
                }}
                className="bg-[#0c0e14] border border-[#222735] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300">Position</label>
              <select
                value={editedPosition}
                onChange={(e) => {
                  const pos = e.target.value as PositionCode;
                  setEditedPosition(pos);
                  onUpdatePlayer(instanceId, {
                    player: {
                      ...player,
                      position: pos,
                      category: getCategoryFromPosition(pos),
                    },
                  });
                }}
                className="bg-[#0c0e14] border border-[#222735] rounded-lg py-1.5 px-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {ALL_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duplicate Shirt Number Warning */}
          {isDuplicateNumber && !allowDuplicateNumber && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl flex items-center justify-between gap-2 text-[11px] text-amber-300">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>#{parsedNumber} is already used</span>
              </div>
              <button
                type="button"
                onClick={() => setAllowDuplicateNumber(true)}
                className="text-[10px] font-bold underline hover:text-amber-200"
              >
                Allow
              </button>
            </div>
          )}

          {/* Display Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-300">Display Name</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value);
                onUpdatePlayer(instanceId, {
                  player: {
                    ...player,
                    shortName: e.target.value,
                  },
                });
              }}
              className="bg-[#0c0e14] border border-[#222735] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Role Note */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-300">Tactical Instruction / Role Note</label>
            <input
              type="text"
              placeholder="e.g. Inverted Wingback, Target Man, Deep Playmaker"
              value={editedRoleNote}
              onChange={(e) => {
                setEditedRoleNote(e.target.value);
                onUpdatePlayer(instanceId, { roleNote: e.target.value });
              }}
              className="bg-[#0c0e14] border border-[#222735] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Token Style */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-300">Player Token Style</label>
            <div className="grid grid-cols-4 gap-1 bg-[#0c0e14] p-1 rounded-xl border border-[#222735]">
              {(['avatar', 'jersey', 'badge', 'minimal'] as MarkerStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onUpdatePlayer(instanceId, { displayStyle: style })}
                  className={`py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                    (displayStyle || 'avatar') === style
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <div className="pt-2 border-t border-[#222735] mt-auto">
          <button
            type="button"
            onClick={() => onRemovePlayer(instanceId)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove {isOnBench ? 'from Bench' : 'from Pitch'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. COMPACT FLOATING BOTTOM HUD (Default on pitch - Non-intrusive!)
  // =========================================================================
  return (
    <>
      {/* Sleek Floating Bottom Player HUD Bar */}
      <div
        className={`pointer-events-auto transition-all duration-200 select-none ${
          isDragging ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {isMinimized ? (
          /* Super Minimalist Pill Mode */
          <div className="flex items-center gap-2 bg-[#12151f]/95 hover:bg-[#161a26] border border-[#2b3347] backdrop-blur-xl px-3 py-1.5 rounded-full shadow-2xl transition-all">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: catColor }}
            />
            <span className="text-xs font-black text-white">#{shirtNumber}</span>
            <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
              {player.shortName || player.name}
            </span>
            {isCaptain && (
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full">
                (C)
              </span>
            )}
            <div className="h-3 w-px bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              title="Expand action bar"
              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Deselect Player (Esc)"
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Compact Action HUD Bar */
          <div className="flex items-center gap-2 sm:gap-2.5 bg-[#121622]/95 border border-[#2b3548] backdrop-blur-xl px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl shadow-2xl">
            {/* Player Info (Avatar, Name, Position, Number) */}
            <div className="flex items-center gap-2 min-w-0 pr-1 border-r border-[#262f42]">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#181c26] border border-[#2d364a] flex-shrink-0">
                <img
                  src={player.avatar}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span
                  className="absolute bottom-0 right-0 px-0.5 text-[7px] font-black text-white rounded"
                  style={{ backgroundColor: catColor }}
                >
                  {editedPosition}
                </span>
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-400">#{shirtNumber}</span>
                  <span className="text-xs font-bold text-slate-100 truncate max-w-[90px] sm:max-w-[130px]">
                    {player.shortName || player.name}
                  </span>
                  {isCaptain && (
                    <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-1 rounded-full flex-shrink-0">
                      (C)
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 truncate max-w-[110px] hidden sm:block">
                  {player.club} • Rating {player.rating}
                </span>
              </div>
            </div>

            {/* Quick Action 1: Captain Toggle */}
            <button
              type="button"
              onClick={() => onSetCaptain(instanceId)}
              title={isCaptain ? 'Remove captain status' : 'Make captain'}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                isCaptain
                  ? 'bg-amber-500/25 border-amber-500/80 text-amber-300 shadow-sm'
                  : 'bg-[#181d2a] hover:bg-amber-500/15 border-[#283246] text-slate-300 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{isCaptain ? 'Captain' : 'Make (C)'}</span>
            </button>

            {/* Quick Action 2: To Bench or To Pitch */}
            {isOnBench ? (
              <button
                type="button"
                onClick={() => onMoveBenchToPitch && onMoveBenchToPitch(instanceId)}
                title="Move to starting lineup pitch"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="hidden md:inline">To Pitch</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMoveToBench(instanceId)}
                title="Move player to substitutes bench"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#181d2a] hover:bg-[#22293b] border border-[#283246] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span className="hidden md:inline">To Bench</span>
              </button>
            )}

            {/* Quick Action 3: Detailed Customization Button */}
            <button
              type="button"
              onClick={() => setShowFullModal(true)}
              title="Edit shirt number, tactical role, token style..."
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#181d2a] hover:bg-[#22293b] border border-[#283246] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Edit Details</span>
            </button>

            {/* Quick Action 4: Remove Player */}
            <button
              type="button"
              onClick={() => onRemovePlayer(instanceId)}
              title={isOnBench ? 'Remove from bench' : 'Remove from pitch'}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 hover:border-rose-500 text-rose-400 hover:text-white text-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-700/60 mx-0.5" />

            {/* Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to tiny pill"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a202e] transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Deselect Player (Esc)"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a202e] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL FOR DETAILED CUSTOMIZATION (Only opens when user asks for it) */}
      {/* ===================================================================== */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#141822] border border-[#262e42] rounded-2xl p-4 sm:p-5 shadow-2xl max-w-sm w-full flex flex-col gap-3.5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#222838] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#181c26] border border-[#2d364a]">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span
                    className="absolute bottom-0 right-0 px-1 text-[8px] font-black text-white rounded"
                    style={{ backgroundColor: catColor }}
                  >
                    {editedPosition}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{player.name}</span>
                    {isCaptain && (
                      <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full">
                        CAPTAIN
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">{player.club} • Rating {player.rating}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a202e]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shirt Number & Position */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-300">Shirt Number</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={editedNumber}
                  onChange={(e) => {
                    setEditedNumber(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onUpdatePlayer(instanceId, { shirtNumber: val });
                    }
                  }}
                  className="bg-[#0c0e14] border border-[#222838] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-300">Position</label>
                <select
                  value={editedPosition}
                  onChange={(e) => {
                    const pos = e.target.value as PositionCode;
                    setEditedPosition(pos);
                    onUpdatePlayer(instanceId, {
                      player: {
                        ...player,
                        position: pos,
                        category: getCategoryFromPosition(pos),
                      },
                    });
                  }}
                  className="bg-[#0c0e14] border border-[#222838] rounded-lg py-1.5 px-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {ALL_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duplicate Shirt Number Warning */}
            {isDuplicateNumber && !allowDuplicateNumber && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl flex items-center justify-between gap-2 text-[11px] text-amber-300">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>#{parsedNumber} is already in this lineup</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDuplicateNumber(true)}
                  className="text-[10px] font-bold underline hover:text-amber-200"
                >
                  Allow
                </button>
              </div>
            )}

            {/* Display Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                  onUpdatePlayer(instanceId, {
                    player: {
                      ...player,
                      shortName: e.target.value,
                    },
                  });
                }}
                className="bg-[#0c0e14] border border-[#222838] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tactical Role Note */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300">Role / Tactical Instruction</label>
              <input
                type="text"
                placeholder="e.g. Inverted Wingback, Target Man, Deep Playmaker"
                value={editedRoleNote}
                onChange={(e) => {
                  setEditedRoleNote(e.target.value);
                  onUpdatePlayer(instanceId, { roleNote: e.target.value });
                }}
                className="bg-[#0c0e14] border border-[#222838] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Player Token Style */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-300">Player Token Style</label>
              <div className="grid grid-cols-4 gap-1 bg-[#0c0e14] p-1 rounded-xl border border-[#222838]">
                {(['avatar', 'jersey', 'badge', 'minimal'] as MarkerStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onUpdatePlayer(instanceId, { displayStyle: style })}
                    className={`py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                      (displayStyle || 'avatar') === style
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions inside modal */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#222838]">
              <button
                type="button"
                onClick={() => onSetCaptain(instanceId)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                  isCaptain
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#181c26] border-[#262d3d] text-slate-200 hover:bg-amber-600 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isCaptain ? 'Captain' : 'Set Captain'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isOnBench) {
                    onMoveBenchToPitch && onMoveBenchToPitch(instanceId);
                  } else {
                    onMoveToBench(instanceId);
                  }
                  setShowFullModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#181c26] hover:bg-[#202535] border border-[#262d3d] text-slate-200 text-xs font-bold transition-all"
              >
                {isOnBench ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isOnBench ? 'To Pitch' : 'To Bench'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRemovePlayer(instanceId);
                  setShowFullModal(false);
                }}
                className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white transition-all"
                title="Remove player"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFullModal(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all mt-1"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
