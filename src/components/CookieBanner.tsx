import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged cookie consent
    const consent = localStorage.getItem('startingxi_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('startingxi_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('startingxi_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="cookie-consent-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#12161f] border border-[#262e3d] rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Privacy & Cookie Notice
            </h4>
            <button
              type="button"
              onClick={handleAcceptEssential}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            We use browser storage to save your tactics and partner with Google AdSense to serve relevant ads that keep this tool 100% free.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Accept All</span>
            </button>

            <button
              type="button"
              onClick={handleAcceptEssential}
              className="py-1 px-2.5 rounded-lg bg-[#1a1f2c] hover:bg-[#232a3b] text-slate-300 hover:text-white font-medium text-xs border border-[#2b3344] transition-colors"
            >
              Essential Only
            </button>

            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                onOpenPrivacyPolicy();
              }}
              className="text-[11px] text-emerald-400 hover:underline ml-auto font-medium"
            >
              Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
