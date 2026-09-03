import React, { useState, useEffect } from 'react';
import { Player, PositionCode, PositionCategory } from '../types';
import { X, UserPlus, Sparkles, Image, Check, Star } from 'lucide-react';
import { getCategoryFromPosition } from '../data/players';

interface CustomPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlayer: (player: Player) => void;
  editingPlayer?: Player | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

const POSITIONS: PositionCode[] = [
  'ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'GK'
];

export const CustomPlayerModal: React.FC<CustomPlayerModalProps> = ({
  isOpen,
  onClose,
  onSavePlayer,
  editingPlayer,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [shirtNumber, setShirtNumber] = useState('10');
  const [position, setPosition] = useState<PositionCode>('ST');
  const [club, setClub] = useState('Custom FC');
  const [nationality, setNationality] = useState('United Kingdom');
  const [rating, setRating] = useState('85');
  const [preferredFoot, setPreferredFoot] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setShortName(editingPlayer.shortName);
      setShirtNumber(editingPlayer.shirtNumber.toString());
      setPosition(editingPlayer.position);
      setClub(editingPlayer.club);
      setNationality(editingPlayer.nationality);
      setRating(editingPlayer.rating.toString());
      setPreferredFoot(editingPlayer.preferredFoot || 'Right');
      setAvatar(editingPlayer.avatar);
      setCustomAvatarUrl('');
    } else {
      setName('');
      setShortName('');
      setShirtNumber('10');
      setPosition('ST');
      setClub('Custom FC');
      setNationality('Spain');
      setRating('85');
      setPreferredFoot('Right');
      setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
      setCustomAvatarUrl('');
    }
  }, [editingPlayer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const num = parseInt(shirtNumber, 10) || 10;
    const rat = parseInt(rating, 10) || 80;
    const finalAvatar = customAvatarUrl.trim() || avatar;
    const category = getCategoryFromPosition(position);

    const playerToSave: Player = {
      id: editingPlayer ? editingPlayer.id : `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().split(' ').slice(-1)[0],
      position,
      category,
      secondaryPositions: [],
      club: club.trim() || 'Free Agent',
      league: 'Custom / Other',
      nationality: nationality.trim() || 'Global',
      shirtNumber: num,
      rating: Math.min(99, Math.max(40, rat)),
      avatar: finalAvatar,
      preferredFoot,
      isCustom: true,
    };

    onSavePlayer(playerToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14171e] border border-[#262c38] rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222834] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {editingPlayer ? 'Edit Custom Player' : 'Create Custom Player'}
              </h2>
              <p className="text-xs text-slate-400">Add yourself, teammates, or legend players</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1f2430]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
          {/* Avatar selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Player Photo / Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#181c24] border-2 border-emerald-500 flex-shrink-0 shadow-md">
                <img
                  src={customAvatarUrl.trim() || avatar}
                  alt="Avatar preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(avUrl);
                        setCustomAvatarUrl('');
                      }}
                      className={`w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 transition-transform ${
                        avatar === avUrl && !customAvatarUrl
                          ? 'ring-2 ring-emerald-400 scale-105 border-emerald-500'
                          : 'border-[#262c38] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="bg-[#0e1015] border border-[#222834] rounded-lg py-1 px-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Leo Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!shortName) setShortName(e.target.value.split(' ').slice(-1)[0]);
                }}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Short / Display Name</label>
              <input
                type="text"
                placeholder="e.g. Silva"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Position, Shirt Number & Rating */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PositionCode)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Shirt Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={shirtNumber}
                onChange={(e) => setShirtNumber(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Rating (40-99)</label>
              <input
                type="number"
                min="40"
                max="99"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Club & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Club / Team</label>
              <input
                type="text"
                placeholder="e.g. Starting XI FC"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Nationality</label>
              <input
                type="text"
                placeholder="e.g. Brazil, Spain, France..."
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Preferred Foot */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Preferred Foot</label>
            <div className="flex items-center gap-2 bg-[#0e1015] p-1 rounded-xl border border-[#222834]">
              {(['Right', 'Left', 'Both'] as const).map((foot) => (
                <button
                  key={foot}
                  type="button"
                  onClick={() => setPreferredFoot(foot)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    preferredFoot === foot
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {foot}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222834]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#181c24] hover:bg-[#222834] text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingPlayer ? 'Save Changes' : 'Create & Add Player'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
