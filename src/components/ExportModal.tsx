import React, { useState } from 'react';
import { Lineup } from '../types';
import { toPng, toBlob } from 'html-to-image';
import { X, Download, Copy, Check, Sparkles, Image, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineup: Lineup;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, lineup }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    const pitchElement = document.getElementById('tactics-pitch-canvas');
    if (!pitchElement) return;

    try {
      setIsExporting(true);
      // Generate clean PNG blob
      const dataUrl = await toPng(pitchElement, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#091e14',
      });

      const link = document.createElement('a');
      const filename = `${(lineup.title || 'starting-xi')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-tactics.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
      setIsExporting(false);
    } catch (err) {
      console.error('Failed to export image:', err);
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const pitchElement = document.getElementById('tactics-pitch-canvas');
    if (!pitchElement) return;

    try {
      setIsExporting(true);
      const blob = await toBlob(pitchElement, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#091e14',
      });

      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
      setIsExporting(false);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14171e] border border-[#262c38] rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222834] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Export Tactics Board</h3>
              <p className="text-xs text-slate-400">High-resolution PNG image with pitch & tactical annotations</p>
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

        {/* Export Details */}
        <div className="bg-[#0e1015] border border-[#222834] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Lineup Title:</span>
            <span className="font-bold text-slate-100">{lineup.title}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Formation:</span>
            <span className="font-bold text-emerald-400">{lineup.formationId.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Players on Pitch:</span>
            <span className="font-bold text-slate-100">{lineup.players.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tactical Annotations:</span>
            <span className="font-bold text-amber-400">{lineup.annotations.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating High-Res Image...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PNG (2.5x HD)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Image to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
