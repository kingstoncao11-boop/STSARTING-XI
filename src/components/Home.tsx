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
  Cpu,
  Mail,
  Heart,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { SAMPLE_SAVED_LINEUPS } from '../data/defaultLineups';
import { LegalTab } from './LegalModal';
import { AdBanner } from './AdBanner';
import { Footer } from './Footer';

interface HomeProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectLineupTemplate: (lineup: Lineup) => void;
  onOpenLegal?: (tab: LegalTab) => void;
  onOpenAdSenseGuide?: () => void;
  onOpenContact?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  onSelectLineupTemplate,
  onOpenLegal = (_tab: LegalTab = 'privacy') => {},
  onOpenAdSenseGuide = () => {},
  onOpenContact = () => {},
}) => {
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
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Football Tactics & Squad Architecture</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
            Build Your Tactical <span className="text-emerald-400">Starting XI</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
            Create formations, design tactics, freely position players, and build your own football lineups with authentic pro datasets and drawing tools.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('tactics')}
              className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-500"
            >
              <span>Open Tactics Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('lineups')}
              className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors"
            >
              <span>Saved Lineups</span>
            </button>
          </div>

          {/* Interactive Tactical Board Showcase Preview */}
          <div className="mt-10 w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Matchday Tactical Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-slate-700">
                  4-3-3 Attacking
                </span>
              </div>
            </div>

            {/* Simulated mini pitch */}
            <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden pitch-stripes-horizontal border border-[#1b432a] flex items-center justify-center cursor-pointer" onClick={() => onNavigate('tactics')}>
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

      {/* Policy-compliant Ad Placement (Leaderboard / Responsive Banner) */}
      <div className="w-full bg-[#0d1017] border-b border-slate-800/60 py-3 px-4 flex justify-center">
        <AdBanner
          format="leaderboard"
          onOpenAdSenseGuide={onOpenAdSenseGuide}
          className="max-w-4xl"
        />
      </div>

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
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-lg p-4 shadow-sm transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    {tpl.formationId.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-500">{tpl.players.length} Players</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {tpl.notes || 'Full matchday lineup with tactical player positioning.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs font-semibold text-slate-300 group-hover:text-emerald-400">
                <span>Load Template</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Built for Modern Football Tactics
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything coaches, analysts, and football enthusiasts need to visualize tactics with professional precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {feat.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-1">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#0c0e13]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-[#141822] to-[#10131a] border border-[#232a3b] rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-4">
                <Heart className="w-3.5 h-3.5 fill-emerald-400/20" />
                <span>About Starting XI</span>
              </div>

              {/* Title & Mission Statement */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Crafted for Football Tacticians, FPL Managers & Fans
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Starting XI is an independent, free-to-use football tactics board and lineup architect built for managers, Fantasy Premier League (FPL) enthusiasts, grassroots coaches, and football analysts worldwide. We believe tactical planning and squad building should be fast, visual, and open to all — without mandatory logins, paywalls, or restrictive software.
              </p>

              {/* Highlights Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-2.5">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">FPL & Fantasy Friendly</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                      Plan your weekly gameweek starting 11, visualize bench setups, test captaincy calls, and debate transfers with your mini-league rivals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-2.5">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tactical Drawing Suite</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                      Draw pressing sawteeth, curved runs, passing lanes, and highlight defensive blocks directly onto horizontal or vertical pitches.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-2.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Community & Open Access</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                      100% free with top international pro players, custom player creation, instant image exports, and community-requested updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Banner Inside About Us */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1017] p-5 rounded-xl border border-[#1f2636]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Have feedback, suggestions or need a player added?</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      We review all community feedback, feature requests, and FPL tool ideas directly.
                    </p>
                    <code className="text-[11px] font-mono text-emerald-400 mt-1 inline-block">
                      startingxifplbuildercontact@gmail.com
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Us</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('about')}
                    className="hidden md:flex py-2 px-3 rounded-lg bg-[#181c24] hover:bg-[#222733] border border-[#272d3b] text-slate-300 hover:text-white font-medium text-xs items-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>About Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer
        onOpenLegal={onOpenLegal}
        onOpenAdSenseGuide={onOpenAdSenseGuide}
        onOpenContact={onOpenContact}
        showAdBanner={false}
      />
    </div>
  );
};
