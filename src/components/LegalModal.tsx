import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Info,
  DollarSign,
  Mail,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'about' | 'adsense';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      id="legal-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="legal-modal-container"
        className="bg-[#12151b] border border-[#222733] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#212632] flex items-center justify-between bg-[#151820]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white border border-emerald-500/40">
              <Shield className="w-4 h-4 fill-white/20" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Starting<span className="text-emerald-400">XI</span> Legal & Transparency
              </h2>
              <p className="text-[11px] text-slate-400">
                Compliance, Privacy Policy, Terms & Advertising Standards
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#212632] bg-[#0d0f14] px-4 overflow-x-auto text-xs font-semibold gap-1 sm:gap-2">
          {[
            { id: 'privacy' as LegalTab, label: 'Privacy Policy', icon: Lock },
            { id: 'terms' as LegalTab, label: 'Terms of Service', icon: FileText },
            { id: 'about' as LegalTab, label: 'About & Contact', icon: Info },
            { id: 'adsense' as LegalTab, label: 'AdSense & Transparency', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#161a22]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
          {/* ========================================================================= */}
          {/* PRIVACY POLICY (MANDATORY GOOGLE ADSENSE COMPLIANCE DISCLOSURES) */}
          {/* ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  Official Policy • Updated September 2026
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">Privacy Policy</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This Privacy Policy describes how Starting XI collects, uses, and safeguards information when you use our football tactics board and lineup creation service.
                </p>
              </div>

              {/* Google AdSense Explicit Disclosure Section */}
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4>Third-Party Advertising & Google AdSense Disclosures</h4>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  We use third-party advertising companies, specifically <strong>Google AdSense</strong> and its affiliate network, to serve advertisements when you visit our website.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-2">
                  <li>
                    <strong>Third-party vendors, including Google</strong>, use cookies (including the DoubleClick cookie) to serve ads based on a user’s prior visits to our website or other websites on the internet.
                  </li>
                  <li>
                    <strong>Google’s use of advertising cookies</strong> enables it and its partners to serve personalized or contextual advertisements to our visitors based on their browsing patterns across the web.
                  </li>
                  <li>
                    <strong>User Opt-Out:</strong> You may opt out of personalized advertising by visiting the Google Ads Settings page at{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline inline-flex items-center gap-0.5 hover:text-emerald-300"
                    >
                      www.google.com/settings/ads <ExternalLink className="w-3 h-3" />
                    </a>
                    . Alternatively, you can opt out of third-party vendor cookies for interest-based advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline inline-flex items-center gap-0.5 hover:text-emerald-300"
                    >
                      www.aboutads.info/choices <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    or Network Advertising Initiative at{' '}
                    <a
                      href="https://www.networkadvertising.org/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline inline-flex items-center gap-0.5 hover:text-emerald-300"
                    >
                      networkadvertising.org <ExternalLink className="w-3 h-3" />
                    </a>
                    .
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">1. Information We Store Locally (Client-Side Storage)</h4>
                <p className="text-xs text-slate-400">
                  Starting XI is designed to prioritize user privacy and offline responsiveness. Your custom lineups, tactical drawings, saved formations, and roster edits are stored directly in your browser's <code>localStorage</code>. This data never leaves your device unless you explicitly choose to generate a public share link or export an image.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">2. Cookies and Web Beacons</h4>
                <p className="text-xs text-slate-400">
                  Like most modern web services, this site and its third-party service partners use standard web cookies, local storage, and server log files. These are used to store visitors’ preferences, remember session states, track referral sources, and optimize the delivery of webpage content and advertisement impressions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">3. CCPA & California Privacy Rights</h4>
                <p className="text-xs text-slate-400">
                  Under the California Consumer Privacy Act (CCPA), California consumers have the right to request disclosure of personal data collected, request deletion of personal information, and opt out of the sale of personal information. We do not sell personally identifiable information. You can manage your ad personalization via the opt-out mechanisms listed above.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">4. GDPR European User Consent</h4>
                <p className="text-xs text-slate-400">
                  For visitors residing in the European Economic Area (EEA) and United Kingdom, we adhere to the European General Data Protection Regulation (GDPR). Users can adjust their cookie preferences via our cookie banner at any time.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">5. Contact Information</h4>
                <p className="text-xs text-slate-400">
                  If you have questions or inquiries regarding our Privacy Policy or data handling practices, please contact us directly at{' '}
                  <a href="mailto:startingxifplbuildercontact@gmail.com" className="text-emerald-400 underline hover:text-emerald-300">
                    startingxifplbuildercontact@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TERMS OF SERVICE */}
          {/* ========================================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  User Agreement • Effective 2026
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">Terms of Service</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Please read these Terms of Service carefully before using Starting XI Tactics Studio.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">1. Acceptance of Terms</h4>
                <p className="text-xs text-slate-400">
                  By accessing or using Starting XI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">2. Permitted Use & Fair Use Disclaimer</h4>
                <p className="text-xs text-slate-400">
                  Starting XI provides educational, recreational, and professional tactical diagramming tools for football coaches, analysts, and fans. Player names, ratings, and positions are provided for sports simulation and analytical diagramming purposes under nominative fair use. We are an independent software tool and are not officially affiliated with FIFA, UEFA, the Premier League, or individual football clubs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">3. User-Generated Content & Tactical Exports</h4>
                <p className="text-xs text-slate-400">
                  You retain ownership of any custom tactical setups, exported images, and lineups you create. You are free to share your exported tactical images on social media, video platforms, coaching blogs, or educational channels.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">4. Prohibited Conduct</h4>
                <p className="text-xs text-slate-400">
                  Users may not attempt to reverse engineer, disrupt, overload, or distribute malicious scripts against this service, nor attempt to fraudulently simulate clicks or automated traffic on advertisements served by Google AdSense.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">5. Disclaimer of Warranties & Limitation of Liability</h4>
                <p className="text-xs text-slate-400">
                  The materials and tools on this website are provided on an 'as is' basis. Starting XI makes no warranties, expressed or implied, and hereby disclaims all other warranties including merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABOUT & CONTACT */}
          {/* ========================================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  Mission & Publisher Profile
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">About Starting XI Studio</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A high-performance tactical board, formation architect, and squad management engine for modern football.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Our Purpose</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Starting XI was created to give football coaches, analysts, content creators, and dedicated fans a professional-grade tactical drawing suite right in their browser without requiring complex desktop software or paid subscriptions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">Key Capabilities</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Featuring vector tactical arrows with distinctive geometry (pressing sawteeth, wide-gap passing lanes, dribbling waves), authentic international player datasets, custom player creation, and 2.5x high-res image export.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Publisher & Support Contact
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    For technical support, FPL feature requests, copyright inquiries, business partnerships, or advertising questions:
                  </p>
                  <p className="text-xs font-semibold text-emerald-400 mt-1">
                    startingxifplbuildercontact@gmail.com
                  </p>
                </div>

                <a
                  href="mailto:startingxifplbuildercontact@gmail.com?subject=Starting%20XI%20Inquiry"
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Send Email
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADSENSE & MONETIZATION TRANSPARENCY */}
          {/* ========================================================================= */}
          {activeTab === 'adsense' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
                  Monetization & Ad Quality Standards
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">Advertising Transparency</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How advertisements support this application while safeguarding user experience and adhering to Google Publisher Policies.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">100% Free Access for Everyone</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      We monetize through non-intrusive Google AdSense advertising so that all formations, drawing tools, and exports remain completely free for grassroots coaches and enthusiasts.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Strict Ad Placement Quality</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ads are segregated into clearly labeled containers labeled "ADVERTISEMENT". We strictly avoid popups, intrusive audio, or placing ads near interactive draggable players to prevent accidental clicks.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Authorized Digital Sellers (ads.txt)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Our site includes a validated <code>ads.txt</code> configuration according to IAB Tech Lab standards to prevent ad fraud and guarantee authentic inventory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#212632] bg-[#101217] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>© 2026 Starting XI Tactics Studio</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-400 font-medium">AdSense Policy Compliant</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#1f242e] hover:bg-[#282e3b] text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
