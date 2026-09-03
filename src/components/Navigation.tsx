import React, { useState } from 'react';
import { ActiveTab } from '../types';
import {
  Shield,
  LayoutGrid,
  Users,
  FolderHeart,
  Plus,
  Download,
  Share2,
  Menu,
  X,
  Sparkles,
  Save,
  Check
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onSaveCurrentLineup: () => void;
  hasUnsavedChanges?: boolean;
  isSaved?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  onOpenExportModal,
  onOpenShareModal,
  onSaveCurrentLineup,
  hasUnsavedChanges = false,
  isSaved = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'tactics', label: 'Tactics Board', icon: Shield },
    { id: 'players', label: 'Player Database', icon: Users },
    { id: 'lineups', label: 'My Lineups', icon: FolderHeart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#13161c]/95 border-b border-[#222733] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onChangeTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-400/30">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              Starting<span className="text-emerald-400">XI</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">
              Tactics Builder
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0b0d11]/80 p-1 rounded-xl border border-[#1e232d] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1a1e27]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick save button if on tactics */}
          {activeTab === 'tactics' && (
            <button
              type="button"
              onClick={onSaveCurrentLineup}
              title="Save current lineup to local storage"
              className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                isSaved
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                  : 'bg-[#181c24] hover:bg-[#202530] border-[#262c38] text-slate-200 hover:text-white'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save Tactic'}</span>
            </button>
          )}

          {/* Export PNG button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            title="Export pitch as high-res PNG image"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 hover:text-white text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Image</span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            title="Share lineup link or file"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#181c24] border border-[#262c38] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#13161c] border-b border-[#222733] p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChangeTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-[#1a1e27] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
