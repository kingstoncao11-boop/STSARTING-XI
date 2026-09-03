import React, { useState } from 'react';
import { Formation, PitchPlayer } from '../types';
import { PRESET_FORMATIONS } from '../data/formations';
import { Shield, Sparkles, Plus, Check, ChevronRight } from 'lucide-react';

interface FormationSelectorProps {
  currentFormationId: string;
  onSelectFormation: (formation: Formation) => void;
  onSaveAsCustomFormation?: (name: string) => void;
}

export const FormationSelector: React.FC<FormationSelectorProps> = ({
  currentFormationId,
  onSelectFormation,
  onSaveAsCustomFormation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customFormationName, setCustomFormationName] = useState('');

  const categories = ['All', 'Popular', 'Modern', 'Defensive', 'Attacking', 'Historical'];

  const filteredFormations = PRESET_FORMATIONS.filter((f) => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesQ =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormationName.trim() || !onSaveAsCustomFormation) return;
    onSaveAsCustomFormation(customFormationName.trim());
    setCustomFormationName('');
    setIsCustomModalOpen(false);
  };

  return (
    <div className="bg-[#161922] border border-[#222834] rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222834] pb-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100">Tactical Formations ({PRESET_FORMATIONS.length})</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Save Shape</span>
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search formations (e.g. 4-3-3, 3-2-4-1, 5-4-1)..."
        className="bg-[#0e1015] border border-[#222834] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
      />

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#0e1015] text-slate-400 hover:text-slate-200 border border-[#222834]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Formations Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-0.5">
        {filteredFormations.map((form) => {
          const isSelected = form.id === currentFormationId;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onSelectFormation(form)}
              className={`group text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 relative ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-[#0e1015] hover:bg-[#1c202a] border-[#222834] hover:border-[#2f3747]'
              }`}
            >
              {/* Mini Pitch formation dots preview */}
              <div className="w-full h-12 bg-[#0c1f14] rounded-lg border border-[#143d26] relative overflow-hidden flex items-center justify-center pointer-events-none">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-emerald-800/30" />
                <div className="w-4 h-4 rounded-full border border-emerald-800/30 absolute" />
                {form.slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      slot.position === 'GK' ? 'bg-amber-400' : isSelected ? 'bg-emerald-400' : 'bg-slate-300'
                    }`}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>

              {/* Title & info */}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {form.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-[9px] text-slate-500 truncate mt-0.5">{form.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Save Custom Shape Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#14171d] border border-[#262c38] rounded-2xl max-w-sm w-full p-4 shadow-2xl">
            <h4 className="text-xs font-bold text-slate-100 mb-1">Save Custom Formation</h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Capture your current on-pitch player positioning into a custom formation preset.
            </p>
            <form onSubmit={handleSaveCustom} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="e.g. 4-2-2-2 High Press"
                value={customFormationName}
                onChange={(e) => setCustomFormationName(e.target.value)}
                className="bg-[#0e1015] border border-[#222834] rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1e27] text-slate-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
