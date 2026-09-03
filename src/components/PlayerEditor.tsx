import React, { useState, useEffect } from 'react';
import { PitchPlayer, PositionCode, MarkerStyle } from '../types';
import {
  X,
  Award,
  ArrowRightLeft,
  Trash2,
  Edit2,
  Shield,
  Layers,
  ArrowDownRight,
  AlertTriangle,
  Check,
  UserCheck
} from 'lucide-react';
import { CATEGORY_COLORS, getCategoryFromPosition } from '../data/players';

interface PlayerEditorProps {
  selectedPitchPlayer: PitchPlayer | null;
  allLineupPlayers: PitchPlayer[];
  onClose: () => void;
  onUpdatePlayer: (instanceId: string, updates: Partial<PitchPlayer>) => void;
  onMoveToBench: (instanceId: string) => void;
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
  onClose,
  onUpdatePlayer,
  onMoveToBench,
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

  const handleSave = () => {
    const num = isNaN(parsedNumber) ? shirtNumber : parsedNumber;
    onUpdatePlayer(instanceId, {
      shirtNumber: num,
      roleNote: editedRoleNote.trim() || undefined,
      player: {
        ...player,
        shortName: editedName.trim() || player.shortName,
        position: editedPosition,
        category: getCategoryFromPosition(editedPosition),
      },
    });
  };

  const category = getCategoryFromPosition(editedPosition);
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.MID;

  return (
    <div className="bg-[#161922] border border-[#222834] rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3.5 max-w-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222834] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#181c24] border border-[#262c38]">
            <img
              src={player.avatar}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>{player.name}</span>
              {isCaptain && (
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full">
                  CAPTAIN
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">{player.club} • Rating {player.rating}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a1e27]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Shirt Number */}
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
            className="bg-[#0e1015] border border-[#222834] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Position Select */}
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
            className="bg-[#0e1015] border border-[#222834] rounded-lg py-1.5 px-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
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
            <span>#{parsedNumber} is already assigned in this lineup</span>
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
          className="bg-[#0e1015] border border-[#222834] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Tactical Role Note */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-300">Role / Tactical Instruction</label>
        <input
          type="text"
          placeholder="e.g. Inverted Wingback, Target Man, Roaming #10"
          value={editedRoleNote}
          onChange={(e) => {
            setEditedRoleNote(e.target.value);
            onUpdatePlayer(instanceId, { roleNote: e.target.value });
          }}
          className="bg-[#0e1015] border border-[#222834] rounded-lg py-1.5 px-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Marker Display Style for this player */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-300">Player Token Style</label>
        <div className="grid grid-cols-4 gap-1 bg-[#0e1015] p-1 rounded-xl border border-[#222834]">
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

      {/* Quick Action Buttons: Captain, Bench, Remove */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-[#222834]">
        <button
          type="button"
          onClick={() => onSetCaptain(instanceId)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
            isCaptain
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-[#181c24] border-[#262c38] text-slate-200 hover:bg-amber-600 hover:text-white hover:border-amber-500'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{isCaptain ? 'Captain' : 'Set Captain'}</span>
        </button>

        <button
          type="button"
          onClick={() => onMoveToBench(instanceId)}
          title="Move to substitutes bench"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>To Bench</span>
        </button>

        <button
          type="button"
          onClick={() => onRemovePlayer(instanceId)}
          title="Remove from pitch"
          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
