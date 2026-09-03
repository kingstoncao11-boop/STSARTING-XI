import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Shield,
  Zap,
  Check,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Sliders,
  Users
} from 'lucide-react';
import { TacticalPreset, TacticalConcept, TacticalRoleDefinition, PlayerRoleName } from '../types';

interface TacticalOptionsPanelProps {
  presets: TacticalPreset[];
  concepts: TacticalConcept[];
  roles: TacticalRoleDefinition[];
  activePresetId?: string;
  onApplyPreset: (preset: TacticalPreset) => void;
  onAssignRole?: (roleName: PlayerRoleName) => void;
  selectedPlayerName?: string;
}

export const TacticalOptionsPanel: React.FC<TacticalOptionsPanelProps> = ({
  presets,
  concepts,
  roles,
  activePresetId,
  onApplyPreset,
  onAssignRole,
  selectedPlayerName,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'concepts' | 'roles'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<TacticalPreset | null>(presets[0] || null);
  const [selectedConcept, setSelectedConcept] = useState<TacticalConcept | null>(null);

  // Filter Presets
  const filteredPresets = presets.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQ =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  // Filter Concepts
  const filteredConcepts = concepts.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesQ =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  // Filter Roles
  const filteredRoles = roles.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQ =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="bg-[#121622] border border-[#222838] rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Segment Tabs */}
      <div className="p-3 bg-[#151a28] border-b border-[#222838] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#0e121c] p-1 rounded-xl border border-[#222838] w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab('presets');
              setSelectedCategory('All');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tactical Presets ({presets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('concepts');
              setSelectedCategory('All');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'concepts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tactical Theory ({concepts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('roles');
              setSelectedCategory('All');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'roles'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Player Roles ({roles.length})</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 bg-[#0f131f] border-b border-[#1f2536] flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="bg-[#171b28] border border-[#272e42] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44"
        />

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {activeTab === 'presets' &&
            ['All', 'Modern', 'Pressing', 'Defensive', 'Attacking', 'Possession'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#151926] border-[#222838] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}

          {activeTab === 'concepts' &&
            ['All', 'Attacking', 'Defending', 'Transitions'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#151926] border-[#222838] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}

          {activeTab === 'roles' &&
            ['All', 'GK', 'DEF', 'MID', 'ATT'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-[#151926] border-[#222838] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {/* PRESETS VIEW */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredPresets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-[#161a27] border-[#252c3e] hover:border-[#353f58]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {preset.name}
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1e2436] text-emerald-400 border border-[#2b344d]">
                        {preset.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                      {preset.description}
                    </p>

                    {/* Tactical Specifications */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-3 bg-[#0d1017] p-2 rounded-lg border border-[#1f2536]">
                      <div>
                        <span className="text-slate-500 block">Defensive Line:</span>
                        <span className="text-slate-200 font-medium">{preset.tacticalInstructions.defensiveLine}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Pressing:</span>
                        <span className="text-slate-200 font-medium">{preset.tacticalInstructions.pressingIntensity}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Build-Up:</span>
                        <span className="text-slate-200 font-medium">{preset.tacticalInstructions.buildUpStyle}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#212739] hover:bg-emerald-600 text-slate-200 hover:text-white border border-[#2e374f]'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active on Tactics Board</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Apply Preset to Pitch</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CONCEPTS VIEW */}
        {activeTab === 'concepts' && (
          <div className="space-y-2">
            {filteredConcepts.map((concept) => (
              <div
                key={concept.id}
                className="p-3 bg-[#151926] border border-[#23293a] rounded-xl hover:border-[#333c54] transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{concept.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2334] text-sky-400 border border-[#283147]">
                      {concept.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({concept.phase})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {concept.detailedMechanics}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1f2538] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400 font-medium">Coaching Cue:</span>
                    <span className="italic text-slate-300">"{concept.coachingCue}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ROLES VIEW */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="p-3 bg-[#151926] border border-[#23293a] rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{role.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1d2334] text-emerald-400 border border-[#283147]">
                      {role.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="text-[10px] text-slate-400 mb-2.5">
                    <span className="text-slate-500 block mb-0.5 font-semibold">Key Instructions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {role.keyInstructions.map((ins, idx) => (
                        <li key={idx}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {onAssignRole && (
                  <button
                    type="button"
                    onClick={() => onAssignRole(role.id)}
                    className="mt-1 py-1.5 px-3 bg-[#202638] hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-[#2e374f] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Assign Role {selectedPlayerName ? `to ${selectedPlayerName}` : ''}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
