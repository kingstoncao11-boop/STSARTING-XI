import React, { useState, useMemo } from 'react';
import { Player, PositionCategory } from '../types';
import {
  Search,
  Filter,
  UserPlus,
  Star,
  Shield,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { CATEGORY_COLORS } from '../data/players';
import { PlayerAvatar } from './PlayerAvatar';
import confetti from 'canvas-confetti';

interface PlayerDatabaseViewProps {
  allPlayers: Player[];
  onAddToLineup: (player: Player) => void;
  onOpenCreateCustomPlayer: () => void;
  onEditCustomPlayer: (player: Player) => void;
  onDeleteCustomPlayer: (id: string) => void;
}

export const PlayerDatabaseView: React.FC<PlayerDatabaseViewProps> = ({
  allPlayers,
  onAddToLineup,
  onOpenCreateCustomPlayer,
  onEditCustomPlayer,
  onDeleteCustomPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PositionCategory>('ALL');
  const [selectedClub, setSelectedClub] = useState<string>('ALL');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedNationality, setSelectedNationality] = useState<string>('ALL');
  const [minRating, setMinRating] = useState<number>(50);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Extract unique clubs, leagues, nationalities
  const clubs = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => p.club && set.add(p.club));
    return Array.from(set).sort();
  }, [allPlayers]);

  const leagues = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => p.league && set.add(p.league));
    return Array.from(set).sort();
  }, [allPlayers]);

  const nationalities = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => p.nationality && set.add(p.nationality));
    return Array.from(set).sort();
  }, [allPlayers]);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q);
        const matchClub = p.club.toLowerCase().includes(q);
        const matchNat = p.nationality.toLowerCase().includes(q);
        const matchPos = p.position.toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchNat && !matchPos) return false;
      }

      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (selectedClub !== 'ALL' && p.club !== selectedClub) return false;
      if (selectedLeague !== 'ALL' && p.league !== selectedLeague) return false;
      if (selectedNationality !== 'ALL' && p.nationality !== selectedNationality) return false;
      if (p.rating < minRating) return false;

      return true;
    });
  }, [allPlayers, searchTerm, selectedCategory, selectedClub, selectedLeague, selectedNationality, minRating]);

  const handleAdd = (player: Player) => {
    onAddToLineup(player);
    setAddedIds((prev) => new Set([...prev, player.id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(player.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14171f] border border-[#222834] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Player Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">{filteredPlayers.length} Total Players</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Football Player Database
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Browse world-class international stars, filter by league, club, or position, and create custom players for your squads.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateCustomPlayer}
          className="relative z-10 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Custom Player</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#14171f] border border-[#222834] rounded-2xl p-4 flex flex-col gap-3 shadow-lg backdrop-blur-md">
        {/* Search row & Category pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, club, nationality, or position..."
              className="w-full pl-9 pr-8 py-2 bg-[#0e1015] border border-[#222834] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Position categories */}
          <div className="flex items-center gap-1 bg-[#0e1015] p-1 rounded-xl border border-[#222834] w-full sm:w-auto">
            {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 sm:flex-initial py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222834]">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="bg-[#0e1015] border border-[#222834] rounded-xl py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Clubs</option>
            {clubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="bg-[#0e1015] border border-[#222834] rounded-xl py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Leagues</option>
            {leagues.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="bg-[#0e1015] border border-[#222834] rounded-xl py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Nationalities</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-[#0e1015] border border-[#222834] rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Min Rating: {minRating}</span>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const isAdded = addedIds.has(player.id);
            const catColor = CATEGORY_COLORS[player.category] || CATEGORY_COLORS.MID;

            return (
              <div
                key={player.id}
                className="bg-[#14171f] border border-[#222834] hover:border-[#333b4d] rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-3 transition-all hover:translate-y-[-2px] group"
              >
                {/* Top: Avatar, Rating & Badges */}
                <div className="flex items-start gap-3">
                  <PlayerAvatar player={player} size="lg" showNumberBadge />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                        {player.position}
                      </span>
                      {player.isCustom && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] px-1 py-0.2 rounded font-mono">
                          Custom
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 truncate mt-1 group-hover:text-emerald-400 transition-colors">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{player.club}</p>
                  </div>
                </div>

                {/* Middle: Stats / Details */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-[#0e1015] p-2 rounded-xl border border-[#222834]">
                  <span className="truncate">{player.nationality}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3 h-3 fill-emerald-400" />
                    <span>{player.rating} OVR</span>
                  </span>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdd(player)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[#181c24] hover:bg-emerald-600 border-[#262c38] hover:border-emerald-500 text-slate-200 hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Starting XI</span>
                      </>
                    )}
                  </button>

                  {player.isCustom && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditCustomPlayer(player)}
                        title="Edit player"
                        className="p-2 rounded-xl bg-[#181c24] hover:bg-[#222834] border border-[#262c38] text-slate-300 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomPlayer(player.id)}
                        title="Delete player"
                        className="p-2 rounded-xl bg-[#181c24] hover:bg-rose-600/80 border border-[#262c38] text-slate-400 hover:text-white text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#14171f] border border-[#222834] rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Player not found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            No verified player records match your search filters. In accordance with database accuracy standards, AI-generated or guessed players are never substituted.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedClub('ALL');
                setSelectedLeague('ALL');
                setSelectedNationality('ALL');
                setMinRating(50);
              }}
              className="py-2 px-4 rounded-xl bg-[#1e2434] hover:bg-[#283146] text-slate-200 border border-[#2e374f] text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenCreateCustomPlayer}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              Create Custom Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
