import React, { useState } from 'react';
import { Lineup } from '../types';
import { encodeLineupToURL } from '../utils/storage';
import { X, Share2, Copy, Check, FileJson, Upload, Link2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineup: Lineup;
  onImportLineup: (importedLineup: Lineup) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lineup,
  onImportLineup,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const shareUrl = encodeLineupToURL(lineup);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lineup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${lineup.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
    downloadAnchor.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.players && Array.isArray(parsed.players)) {
            onImportLineup(parsed as Lineup);
            onClose();
          } else {
            alert('Invalid Starting XI lineup file format.');
          }
        } catch (err) {
          alert('Could not parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14171e] border border-[#262c38] rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222834] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Share Tactics & Lineup</h3>
              <p className="text-xs text-slate-400">Share via instant URL link or export tactic file</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1f2430]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shareable URL Box */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shareable Tactics Link</span>
          </label>
          <div className="flex items-center gap-2 bg-[#0e1015] border border-[#222834] rounded-xl p-1.5 pl-3">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-300 flex-1 truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow flex-shrink-0 transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Anyone with this link will immediately load your full Starting XI setup, positions, and tactical drawings.
          </p>
        </div>

        {/* JSON Backup & Import Section */}
        <div className="pt-3 border-t border-[#222834] flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">File Backup & Import</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="py-2 px-3 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Export JSON</span>
            </button>

            <label className="py-2 px-3 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
