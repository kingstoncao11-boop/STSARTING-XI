import React, { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, ExternalLink, Info } from 'lucide-react';

export type AdFormat = 'leaderboard' | 'rectangle' | 'banner';

interface AdBannerProps {
  format?: AdFormat;
  slotId?: string; // Optional custom AdSense slot ID
  adClientId?: string; // Optional custom AdSense publisher ID (ca-pub-XXXXX)
  className?: string;
  onOpenAdSenseGuide?: () => void;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format = 'leaderboard',
  slotId,
  adClientId,
  className = '',
  onOpenAdSenseGuide,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  // Check if real AdSense script is present in index.html
  const isScriptLoaded = typeof window !== 'undefined' && !!window.adsbygoogle;

  useEffect(() => {
    if (isScriptLoaded && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.debug('AdSense push notice:', err);
      }
    }
  }, [isScriptLoaded, slotId]);

  // Dimensions based on standard IAB sizes
  const formatStyles = {
    leaderboard: 'w-full max-w-[728px] min-h-[50px] sm:min-h-[90px]',
    rectangle: 'w-full max-w-[300px] min-h-[250px]',
    banner: 'w-full min-h-[60px] sm:min-h-[75px]',
  }[format];

  return (
    <div
      className={`relative mx-auto my-2 flex flex-col items-center justify-center select-none overflow-hidden ${formatStyles} ${className}`}
      id={`ad-container-${format}`}
    >
      {/* Required Google AdSense Policy Label */}
      <div className="w-full flex items-center justify-between px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-[#0d0f14] border-t border-x border-[#1c212c] rounded-t-lg">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
          Advertisement
        </span>
        {onOpenAdSenseGuide && (
          <button
            type="button"
            onClick={onOpenAdSenseGuide}
            title="Google AdSense Configuration"
            className="hover:text-emerald-400 text-[9px] capitalize transition-colors font-medium flex items-center gap-0.5"
          >
            AdSense Ready <Info className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Main Ad Area */}
      <div className="w-full flex-1 bg-[#101319] border border-[#1c212c] rounded-b-lg flex items-center justify-center p-2 relative">
        {isScriptLoaded && slotId ? (
          /* Live Google AdSense Ins Element */
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={adClientId || 'ca-pub-5187518738979855'}
            data-ad-slot={slotId}
            data-ad-format={format === 'leaderboard' ? 'horizontal' : 'auto'}
            data-full-width-responsive="true"
          />
        ) : (
          /* Clean, Compliant Placeholder when waiting for Publisher ID */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full px-4 py-2 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Google AdSense Slot</span>
                  <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {format}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-configured IAB placement • Ready to monetize with your Publisher ID
                </p>
              </div>
            </div>

            {onOpenAdSenseGuide && (
              <button
                type="button"
                onClick={onOpenAdSenseGuide}
                className="py-1 px-3 rounded-md bg-[#1a1f2b] hover:bg-[#232a3b] border border-[#2b3345] text-slate-300 hover:text-white text-[11px] font-semibold transition-colors shrink-0"
              >
                Connect AdSense ID
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
