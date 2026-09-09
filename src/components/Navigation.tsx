import React, { useState } from 'react';
import { ActiveTab } from '../types';
import {
  Shield,
  LayoutGrid,
  Users,
  FolderHeart,
  Download,
  Share2,
  Menu,
  X,
  Save,
  Check,
  Lock,
  DollarSign
} from 'lucide-react';
import { LegalTab } from './LegalModal';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onSaveCurrentLineup: () => void;
  onOpenLegal?: (tab: LegalTab) => void;
  onOpenAdSenseGuide?: () => void;
  hasUnsavedChanges?: boolean;
  isSaved?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  onOpenExportModal,
  onOpenShareModal,
  onSaveCurrentLineup,
  onOpenLegal,
  onOpenAdSenseGuide,
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
    <header className="sticky top-0 z-40 bg-[#12151b] border-b border-[#212632]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onChangeTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white border border-emerald-500/40">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-0.5">
              Starting<span className="text-emerald-400">XI</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
              Tactics Board
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0b0d11] p-1 rounded-lg border border-[#1e232d]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
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
              className={`hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors ${
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
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 hover:text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Image</span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            title="Share lineup link or file"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-500 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#181c24] border border-[#262c38] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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

          {/* Legal & AdSense quick links in mobile menu */}
          <div className="pt-2 mt-2 border-t border-[#212632] flex items-center justify-between text-xs text-slate-400 px-1">
            {onOpenLegal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLegal('privacy');
                }}
                className="hover:text-emerald-400 flex items-center gap-1 font-medium py-1"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Privacy & Terms</span>
              </button>
            )}

            {onOpenAdSenseGuide && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdSenseGuide();
                }}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold py-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>AdSense</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
