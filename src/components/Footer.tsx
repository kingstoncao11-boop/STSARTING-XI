import React from 'react';
import { Shield, Lock, FileText, Info, DollarSign, Cookie, Heart, Mail } from 'lucide-react';
import { LegalTab } from './LegalModal';
import { AdBanner } from './AdBanner';

interface FooterProps {
  onOpenLegal: (tab: LegalTab) => void;
  onOpenAdSenseGuide: () => void;
  onOpenContact?: () => void;
  showAdBanner?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenAdSenseGuide,
  onOpenContact,
  showAdBanner = true,
}) => {
  return (
    <footer className="w-full border-t border-[#1e232d] bg-[#0c0e12] text-xs text-slate-400 py-6 px-4 sm:px-6 select-none mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
        {/* Optional Leaderboard Ad Unit */}
        {showAdBanner && (
          <div className="w-full flex justify-center pb-2">
            <AdBanner
              format="leaderboard"
              onOpenAdSenseGuide={onOpenAdSenseGuide}
              className="max-w-3xl"
            />
          </div>
        )}

        {/* Brand & Mission Line */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1c212c]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white border border-emerald-500/40">
              <Shield className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">Starting XI</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400 text-[11px]">Free Football Tactics & Squad Studio</span>
            </div>
          </div>

          {/* Legal Navigation Links (Required by Google AdSense) */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3 text-emerald-500/80" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Terms of Service</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLegal('about')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <Info className="w-3 h-3 text-slate-400" />
              <span>About Us</span>
            </button>

            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="hover:text-emerald-400 text-emerald-400/90 transition-colors flex items-center gap-1 font-medium"
              >
                <Mail className="w-3 h-3" />
                <span>Contact</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAdSenseGuide}
              className="text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <DollarSign className="w-3 h-3" />
              <span>AdSense Setup</span>
            </button>
          </nav>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Starting XI. All rights reserved. Powered by Google AdSense network monetization.
          </p>
          <p className="flex items-center gap-1">
            <span>Built for coaches, analysts & fans worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
