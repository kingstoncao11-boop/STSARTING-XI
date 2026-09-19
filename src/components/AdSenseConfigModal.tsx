import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Shield,
  HelpCircle,
  X,
  FileCode,
  Globe
} from 'lucide-react';

interface AdSenseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalModal: () => void;
}

export const AdSenseConfigModal: React.FC<AdSenseConfigModalProps> = ({
  isOpen,
  onClose,
  onOpenLegalModal,
}) => {
  const [publisherId, setPublisherId] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('startingxi_adsense_pub_id') || 'ca-pub-5187518738979855';
    setPublisherId(saved);
  }, []);

  if (!isOpen) return null;

  const handleSaveId = () => {
    localStorage.setItem('startingxi_adsense_pub_id', publisherId.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const currentPubId = publisherId.trim() || 'ca-pub-5187518738979855';
  const adsTxtSnippet = `google.com, ${currentPubId.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`;
  const htmlScriptSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${currentPubId}" crossorigin="anonymous"></script>`;

  return (
    <div
      id="adsense-config-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="adsense-config-modal-container"
        className="bg-[#12151c] border border-[#232936] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#212632] flex items-center justify-between bg-[#151922]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Google AdSense Setup & Monetization Guide
              </h2>
              <p className="text-[11px] text-slate-400">
                Everything you need to get your website approved and generating revenue
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202531] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs sm:text-sm text-slate-300 space-y-5">
          {/* AdSense Approval Readiness Checklist */}
          <div className="bg-[#161a24] border border-[#262e3d] rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AdSense Compliance Readiness Checklist</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Privacy Policy (Google Cookies & Opt-Outs)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Terms of Service & Fair-Use Disclaimers</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Cookie Consent Banner (GDPR / CCPA)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>ads.txt File Created in /public</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Safe Ad Demarcation ("ADVERTISEMENT")</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1117] border border-amber-500/40 flex items-center gap-2 text-amber-300">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>Custom Domain (e.g. tacticsboard.com)</span>
              </div>
            </div>
          </div>

          {/* Publisher ID Input Form */}
          <div className="p-4 rounded-xl bg-[#161a24] border border-[#262e3d] space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Enter Your AdSense Publisher ID</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Found on your Google AdSense Dashboard under <strong>Account → Account Information</strong> (e.g. <code>ca-pub-1234567890123456</code>).
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="ca-pub-1234567890123456"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0e1117] border border-[#2b3345] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleSaveId}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Saved Locally' : 'Save ID'}</span>
              </button>
            </div>
          </div>

          {/* Quick Copy Snippets */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Copy Ready-to-Use Snippets for Your Codebase</span>
            </h3>

            {/* ads.txt copy box */}
            <div className="p-3 rounded-lg bg-[#0e1117] border border-[#222938] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>1. For public/ads.txt</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(adsTxtSnippet, 'ads.txt')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedCode === 'ads.txt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'ads.txt' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-black/40 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
                {adsTxtSnippet}
              </pre>
            </div>

            {/* index.html script copy box */}
            <div className="p-3 rounded-lg bg-[#0e1117] border border-[#222938] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>2. For index.html &lt;head&gt; script tag</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(htmlScriptSnippet, 'script')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedCode === 'script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'script' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-black/40 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
                {htmlScriptSnippet}
              </pre>
            </div>
          </div>

          {/* Next Steps Guide */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-xs">How to Submit Your Site for Google Approval:</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 pl-1">
              <li>
                <strong>Connect Custom Domain:</strong> Export this code to GitHub and deploy to Vercel/Netlify with your custom domain (e.g., <code>startingxi.com</code>).
              </li>
              <li>
                <strong>Sign in to Google AdSense:</strong> Go to <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">adsense.google.com</a> and add your domain under Sites.
              </li>
              <li>
                <strong>Verification:</strong> Google will verify your <code>ads.txt</code> and the meta tag we added to your <code>index.html</code>.
              </li>
              <li>
                <strong>Start Earning:</strong> Once approved, the banners on the home page, tactics footer, and sidebar will automatically display live Google ads and earn revenue.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#212632] bg-[#101217] flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onOpenLegalModal}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Review Privacy Policy & Terms
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#1f242e] hover:bg-[#282e3b] text-white font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
