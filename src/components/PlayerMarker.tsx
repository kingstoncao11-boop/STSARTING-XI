import React, { memo, useState } from 'react';
import { PitchPlayer, LineupDisplaySettings } from '../types';
import { Shield, Award, User, Sparkles } from 'lucide-react';
import { CATEGORY_COLORS } from '../data/players';

interface PlayerMarkerProps {
  pitchPlayer: PitchPlayer;
  isSelected: boolean;
  isDragging: boolean;
  displaySettings: LineupDisplaySettings;
  onClick: (e: React.MouseEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

function getInitials(name: string): string {
  if (!name) return 'XI';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const PlayerMarker: React.FC<PlayerMarkerProps> = memo(({
  pitchPlayer,
  isSelected,
  isDragging,
  displaySettings,
  onClick,
  onPointerDown,
}) => {
  const { player, shirtNumber, isCaptain, x, y } = pitchPlayer;
  const [imgError, setImgError] = useState(false);

  // Reset img error on player change
  React.useEffect(() => {
    setImgError(false);
  }, [player.id, player.avatar]);

  const isGK = player.position === 'GK';
  const category = player.category || 'ATT';
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.MID;
  const markerStyle = pitchPlayer.displayStyle || displaySettings.markerStyle || 'avatar';

  const kitColor = isGK ? displaySettings.gkKitColor : displaySettings.teamKitColor;
  const textColor = isGK ? displaySettings.gkTextColor : displaySettings.teamTextColor;
  const initials = getInitials(player.shortName || player.name);

  return (
    <div
      className={`absolute select-none transition-transform ${
        isDragging ? 'z-40 scale-110 cursor-grabbing opacity-90' : 'z-20 cursor-grab hover:scale-105 active:cursor-grabbing'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <div className="flex flex-col items-center group relative">
        {/* Captain Armband Badge */}
        {isCaptain && (
          <div
            className="absolute -top-2.5 -right-2.5 z-30 bg-amber-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 ring-1 ring-amber-300 animate-pulse"
            title="Team Captain"
          >
            C
          </div>
        )}

        {/* Rating Pill Top Left */}
        {displaySettings.showRatings && player.rating && (
          <div className="absolute -top-2 -left-2 z-30 bg-[#12151c] text-emerald-400 font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-[#262c38] shadow flex items-center gap-0.5">
            <span>{player.rating}</span>
          </div>
        )}

        {/* Marker Body based on display style */}
        {markerStyle === 'avatar' && (
          <div
            className={`relative rounded-full p-0.5 transition-all ${
              isSelected
                ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#0b0d11] shadow-xl'
                : 'ring-1 ring-white/20 shadow-md group-hover:ring-white/50'
            }`}
            style={{ backgroundColor: kitColor }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#181c24] flex items-center justify-center relative border border-black/20">
              {player.avatar && !imgError ? (
                <img
                  src={player.avatar}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1b202a] to-[#0f1115] text-slate-200 font-black text-xs font-mono">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />

              {/* Number overlay on bottom of avatar */}
              {displaySettings.showNumbers && (
                <div
                  className="absolute bottom-0 inset-x-0 py-0.5 text-center text-[10px] font-black leading-none bg-slate-950/85 text-white"
                >
                  #{shirtNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {markerStyle === 'jersey' && (
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex flex-col items-center justify-center transition-all relative border ${
              isSelected
                ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#0b0d11] scale-105 shadow-xl'
                : 'shadow-md group-hover:brightness-110'
            }`}
            style={{
              backgroundColor: kitColor,
              color: textColor,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-tighter opacity-80">
              {player.position}
            </div>
            {displaySettings.showNumbers && (
              <div className="text-base font-black leading-none mt-0.5">
                {shirtNumber}
              </div>
            )}
          </div>
        )}

        {markerStyle === 'badge' && (
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
              isSelected
                ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#0b0d11] bg-[#12151c] border-emerald-400 shadow-xl'
                : 'bg-[#12151c] border-[#262c38] shadow-md group-hover:border-[#3a4456]'
            }`}
          >
            <div className="text-[12px] font-black text-white leading-none">
              #{shirtNumber}
            </div>
            <div className={`text-[9px] font-bold ${catColor.text} mt-0.5`}>
              {player.position}
            </div>
          </div>
        )}

        {markerStyle === 'minimal' && (
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md border ${
              isSelected
                ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#0b0d11] scale-110'
                : 'border-black/30 group-hover:scale-105'
            }`}
            style={{ backgroundColor: kitColor, color: textColor }}
          >
            {shirtNumber}
          </div>
        )}

        {/* Player Name and Position Tag */}
        {displaySettings.showNames && (
          <div className="mt-1 flex flex-col items-center pointer-events-none">
            <div
              className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tracking-tight shadow-md whitespace-nowrap border flex items-center gap-1 backdrop-blur-sm ${
                isSelected
                  ? 'bg-[#12151c] text-emerald-300 border-emerald-500/80 shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                  : 'bg-[#0e1015]/90 text-slate-100 border-[#222834]'
              }`}
            >
              {displaySettings.showPositions && (
                <span className={`text-[9px] font-black uppercase ${catColor.text}`}>
                  {player.position}
                </span>
              )}
              <span className="truncate max-w-[85px] sm:max-w-[105px]">
                {player.shortName || player.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
