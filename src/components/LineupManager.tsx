import React, { useState } from 'react';
import { Lineup } from '../types';
import { LineupCard } from './LineupCard';
import { Plus, Search, Layers, Sparkles, FolderOpen, ArrowUpDown } from 'lucide-react';

interface LineupManagerProps {
  lineups: Lineup[];
  onOpenLineup: (lineup: Lineup) => void;
  onCreateNewLineup: () => void;
  onDuplicateLineup: (id: string) => void;
  onShareLineup: (lineup: Lineup) => void;
  onDeleteLineup: (id: string) => void;
}

export const LineupManager: React.FC<LineupManagerProps> = ({
  lineups,
  onOpenLineup,
  onCreateNewLineup,
  onDuplicateLineup,
  onShareLineup,
  onDeleteLineup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'formation'>('recent');

  const filteredLineups = lineups
    .filter((l) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.teamName.toLowerCase().includes(q) ||
        l.formationId.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'formation') return a.formationId.localeCompare(b.formationId);
      // Recent default
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Lineup Vault
            </span>
            <span className="text-xs text-slate-400 font-mono">{lineups.length} Saved Formations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            My Lineups & Tactics
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Access, duplicate, and modify all your saved football squad sheets, tactical annotations, and matchday formations.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewLineup}
          className="relative z-10 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Starting XI</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved tactics..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="recent">Recently Updated</option>
            <option value="name">Lineup Title</option>
            <option value="formation">Formation</option>
          </select>
        </div>
      </div>

      {/* Lineups Grid */}
      {filteredLineups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLineups.map((lineup) => (
            <LineupCard
              key={lineup.id}
              lineup={lineup}
              onEdit={onOpenLineup}
              onDuplicate={onDuplicateLineup}
              onShare={onShareLineup}
              onDelete={onDeleteLineup}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No matching lineups found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Try searching for a different keyword or create a brand new starting squad.
          </p>
          <button
            type="button"
            onClick={onCreateNewLineup}
            className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            Create Starting XI
          </button>
        </div>
      )}
    </div>
  );
};
