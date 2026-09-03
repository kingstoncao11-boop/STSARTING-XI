import React, { useState, useMemo } from 'react';
import { Player, PositionCategory } from '../types';
import { Search, Filter, Plus, UserPlus, X, ChevronDown, Check } from 'lucide-react';
import { PlayerCard } from './PlayerCard';

interface PlayerSearchProps {
  allPlayers: Player[];
  pitchPlayerIds: Set<string>;
  benchPlayerIds: Set<string>;
  onAddToPitch: (player: Player) => void;
  onAddToBench: (player: Player) => void;
  onOpenCreateCustomPlayer: () => void;
  onEditCustomPlayer: (player: Player) => void;
  onDeleteCustomPlayer: (id: string) => void;
}

const CATEGORY_TABS: { label: string; value: 'ALL' | PositionCategory }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'GK', value: 'GK' },
  { label: 'DEF', value: 'DEF' },
  { label: 'MID', value: 'MID' },
  { label: 'ATT', value: 'ATT' },
];

export const PlayerSearch: React.FC<PlayerSearchProps> = ({
  allPlayers,
  pitchPlayerIds,
  benchPlayerIds,
  onAddToPitch,
  onAddToBench,
  onOpenCreateCustomPlayer,
  onEditCustomPlayer,
  onDeleteCustomPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PositionCategory>('ALL');
  const [selectedClub, setSelectedClub] = useState<string>('ALL');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedNationality, setSelectedNationality] = useState<string>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract unique filter lists
  const clubs = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => {
      if (p.club) set.add(p.club);
    });
    return Array.from(set).sort();
  }, [allPlayers]);

  const leagues = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => {
      if (p.league) set.add(p.league);
    });
    return Array.from(set).sort();
  }, [allPlayers]);

  const nationalities = useMemo(() => {
    const set = new Set<string>();
    allPlayers.forEach((p) => {
      if (p.nationality) set.add(p.nationality);
    });
    return Array.from(set).sort();
  }, [allPlayers]);

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      // Search term matching
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query) || p.shortName.toLowerCase().includes(query);
        const matchClub = p.club.toLowerCase().includes(query);
        const matchNat = p.nationality.toLowerCase().includes(query);
        const matchPos = p.position.toLowerCase().includes(query);
        if (!matchName && !matchClub && !matchNat && !matchPos) return false;
      }

      // Category tab
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Club filter
      if (selectedClub !== 'ALL' && p.club !== selectedClub) {
        return false;
      }

      // League filter
      if (selectedLeague !== 'ALL' && p.league !== selectedLeague) {
        return false;
      }

      // Nationality filter
      if (selectedNationality !== 'ALL' && p.nationality !== selectedNationality) {
        return false;
      }

      return true;
    });
  }, [allPlayers, searchTerm, selectedCategory, selectedClub, selectedLeague, selectedNationality]);

  const hasActiveFilters =
    selectedClub !== 'ALL' || selectedLeague !== 'ALL' || selectedNationality !== 'ALL' || searchTerm.trim() !== '';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedClub('ALL');
    setSelectedLeague('ALL');
    setSelectedNationality('ALL');
  };

  return (
    <div className="flex flex-col h-full bg-[#161922] border border-[#222834] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header & Create Player Action */}
      <div className="p-3.5 border-b border-[#222834] flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <span>Player Database</span>
            <span className="bg-[#1e232d] text-slate-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-[#262c38]">
              {filteredPlayers.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">Search & add to pitch or substitutes</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateCustomPlayer}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex-shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Player</span>
        </button>
      </div>

      {/* Search Input & Category Pills */}
      <div className="p-3 border-b border-[#222834] flex flex-col gap-2.5 bg-[#0e1015]/60">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player, club, nationality, #..."
            className="w-full pl-9 pr-8 py-2 bg-[#12151c] border border-[#222834] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
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

        {/* Position Category Tabs */}
        <div className="flex items-center gap-1 bg-[#0e1015] p-1 rounded-xl border border-[#222834]">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedCategory(tab.value)}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === tab.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1e27]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toggle Advanced Filters (Club, League, Nationality) */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Filter className="w-3 h-3" />
            <span>Filters ({[selectedClub, selectedLeague, selectedNationality].filter((v) => v !== 'ALL').length})</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-rose-400 hover:text-rose-300 text-[11px] font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 gap-2 pt-1 border-t border-[#222834]">
            {/* Club Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-medium">Club</label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="bg-[#12151c] border border-[#222834] rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Clubs</option>
                {clubs.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* League Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-medium">League</label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-[#12151c] border border-[#222834] rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Leagues</option>
                {leagues.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Nationality Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-medium">Nationality</label>
              <select
                value={selectedNationality}
                onChange={(e) => setSelectedNationality(e.target.value)}
                className="bg-[#12151c] border border-[#222834] rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Nationalities</option>
                {nationalities.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Players List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-0">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onAddToPitch={onAddToPitch}
              onAddToBench={onAddToBench}
              onEditCustomPlayer={onEditCustomPlayer}
              onDeleteCustomPlayer={onDeleteCustomPlayer}
              isAlreadyOnPitch={pitchPlayerIds.has(player.id)}
              isAlreadyOnBench={benchPlayerIds.has(player.id)}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2.5">
              <X className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-200">Player not found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No verified record found in the database. In accordance with strict data accuracy, players and statistics are never guessed or hallucinated.
            </p>
            <button
              type="button"
              onClick={onOpenCreateCustomPlayer}
              className="mt-3.5 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Custom Player</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
