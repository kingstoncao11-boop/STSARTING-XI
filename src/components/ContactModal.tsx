import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  X,
  Send,
  MessageSquare,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const contactEmail = 'startingxifplbuildercontact@gmail.com';
  const [copied, setCopied] = useState(false);
  const [subjectCategory, setSubjectCategory] = useState('Feedback & Suggestions');
  const [userMessage, setUserMessage] = useState('');
  const [userName, setUserName] = useState('');

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `[Starting XI] ${subjectCategory}${userName.trim() ? ` - from ${userName.trim()}` : ''}`
    );
    const body = encodeURIComponent(
      `${userMessage.trim() ? `${userMessage.trim()}\n\n` : ''}---\nSent from Starting XI Football Tactics Builder\n`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div
      id="contact-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="contact-modal-container"
        className="bg-[#12151b] border border-[#222733] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#212632] flex items-center justify-between bg-[#151820]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white border border-emerald-500/40">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Contact <span className="text-emerald-400">Starting XI</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                FPL builder inquiries, feedback, bug reports & support
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-300">
          {/* Email Address Highlight Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Official Support & Developer Email
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                <ShieldCheck className="w-3 h-3" /> Direct Inbox
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <code className="text-xs sm:text-sm font-mono text-emerald-300 select-all break-all">
                {contactEmail}
              </code>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="py-1.5 px-3 rounded-md bg-[#1f242e] hover:bg-[#282e3b] text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${contactEmail}?subject=Starting%20XI%20Inquiry`}
                  className="py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Mail Form Helper */}
          <form onSubmit={handleSendEmail} className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compose Message</span>
              </label>
              <span className="text-[10px] text-slate-500">Opens your default email client</span>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Your Name / Team Name (optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex (FPL Manager)"
                className="w-full bg-[#181c24] border border-[#272d3b] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Topic Category */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Reason for Contact
              </label>
              <select
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
                className="w-full bg-[#181c24] border border-[#272d3b] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Feedback & Suggestions">💡 Feedback & General Suggestions</option>
                <option value="FPL & Fantasy Football Feature Request">⚽ FPL / Fantasy League Feature Request</option>
                <option value="Missing Player or Team Roster Request">🏃 Missing Player or Roster Update</option>
                <option value="Bug Report or Technical Issue">🐛 Bug Report or Technical Glitch</option>
                <option value="Advertising, Partnership or Business Inquiry">🤝 Advertising & Partnership Inquiry</option>
                <option value="Other Inquiry">📩 Other Inquiry</option>
              </select>
            </div>

            {/* Message Box */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Your Message
              </label>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                rows={4}
                placeholder="Type your feedback, feature idea, missing player request, or question here..."
                className="w-full bg-[#181c24] border border-[#272d3b] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Submit / Action Button */}
            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-lg bg-[#181c24] hover:bg-[#202530] text-slate-300 font-semibold text-xs transition-colors border border-[#262c38]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
              </button>
            </div>
          </form>

          {/* Guarantee Badges */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Replies usually within 24–48 hours</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>We build user-suggested features</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d0f14] border-t border-[#212632] flex items-center justify-between text-[11px] text-slate-500 px-5">
          <span>Starting XI • Football & FPL Tactics Suite</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
