import React from 'react';
import { ActiveTab, Lineup } from '../types';
import {
  Shield,
  Pencil,
  Users,
  UserPlus,
  Share2,
  Download,
  ArrowRight,
  Sparkles,
  Play,
  Layers,
  Award,
  Footprints,
  Cpu
} from 'lucide-react';
import { SAMPLE_SAVED_LINEUPS } from '../data/defaultLineups';

interface HomeProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectLineupTemplate: (lineup: Lineup) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectLineupTemplate }) => {
  const features = [
    {
      title: 'Custom Formations & Free Positioning',
      description: 'Switch between iconic formation templates or drag players anywhere on the pitch with zero grid restrictions.',
      icon: Shield,
      tag: 'Dynamic Canvas',
    },
    {
      title: 'Pro Tactical Annotations',
      description: 'Draw runs, passing channels, pressing traps, highlight zones, curved runs, and movement paths right over the pitch.',
      icon: Pencil,
      tag: 'Vector Tools',
    },
    {
      title: 'Real Professional Player Database',
      description: 'Preloaded with top international stars, authentic club rosters, accurate shirt numbers, ratings, and positions.',
      icon: Users,
      tag: '50+ Stars',
    },
    {
      title: 'Custom Player Creator',
      description: 'Craft your own football profile, add your friends, local teammates, or customize ratings, avatars, and numbers.',
      icon: UserPlus,
      tag: 'Full Customization',
    },
    {
      title: 'Save, Share & Export HD Images',
      description: 'Persist your tactical library locally, share live links with friends, and export matchday graphics in 2.5x HD resolution.',
      icon: Download,
      tag: 'Instant Export',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Ambient Turf Green Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6 shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>Professional Football Tactics & Squad Builder</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
            Build Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Starting XI</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
            Create formations, design tactics, freely position players, and build your own football lineups with authentic pro datasets and drawing tools.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('tactics')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              <span>Create Tactics</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('lineups')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm transition-all"
            >
              <span>Explore Lineups</span>
            </button>
          </div>

          {/* Interactive Tactical Board Showcase Preview */}
          <div className="mt-12 w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-300 ml-2">Matchday Tactical Canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/30">
                  4-3-3 Attacking
                </span>
              </div>
            </div>

            {/* Simulated mini pitch */}
            <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden pitch-stripes-horizontal border border-emerald-900/50 shadow-inner flex items-center justify-center cursor-pointer" onClick={() => onNavigate('tactics')}>
              {/* Pitch markings */}
              <div className="absolute inset-x-[10%] inset-y-0 border-x border-white/20" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-white/30" />
              <div className="absolute w-20 h-20 rounded-full border border-white/30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

              {/* Sample annotated curved arrow */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <path d="M 20 40 Q 35 25 50 20" stroke="#facc15" strokeWidth="2" fill="none" strokeDasharray="3,3" />
                <path d="M 80 40 Q 65 25 50 20" stroke="#38bdf8" strokeWidth="2" fill="none" />
                <circle cx="50" cy="20" r="6" stroke="#f43f5e" strokeWidth="1.5" fill="none" />
              </svg>

              {/* Sample player chips */}
              <div className="absolute left-[50%] bottom-[8%] -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                <span className="text-amber-400">#1</span> Courtois
              </div>
              <div className="absolute left-[30%] bottom-[28%] -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                <span className="text-sky-400">#4</span> Van Dijk
              </div>
              <div className="absolute left-[70%] bottom-[28%] -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                <span className="text-sky-400">#2</span> Saliba
              </div>
              <div className="absolute left-[50%] top-[45%] -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                <span className="text-emerald-400">#16</span> Rodri
              </div>
              <div className="absolute left-[50%] top-[18%] -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-600 border border-emerald-400 text-[10px] font-bold text-white flex items-center gap-1 shadow-lg ring-2 ring-emerald-400">
                <span className="text-amber-300">#9</span> Haaland
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch Tactics Editor
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK START PRESET TEMPLATES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Iconic Tactical Presets
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Jump straight into tactical analysis with pre-configured world-class lineups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('lineups')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Lineups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SAVED_LINEUPS.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onSelectLineupTemplate(tpl)}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 shadow-xl transition-all cursor-pointer hover:translate-y-[-2px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    {tpl.formationId.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-500">{tpl.players.length} Players</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {tpl.notes || 'Full matchday lineup with tactical player positioning.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs font-bold text-slate-300 group-hover:text-emerald-400">
                <span>Load Template</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Built for Modern Football Tactics
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything coaches, analysts, content creators, and football enthusiasts need to visualize tactics with professional precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {feat.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-1.5">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-300">Starting XI</span>
            <span>— Football Lineup & Tactics Studio</span>
          </div>
          <p>© 2026 Starting XI. Real-time tactical board & formation engine.</p>
        </div>
      </footer>
    </div>
  );
};
