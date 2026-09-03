import React, { useState } from 'react';
import { Player, PositionCategory } from '../types';
import { CATEGORY_COLORS } from '../data/players';

interface PlayerAvatarProps {
  player: {
    name: string;
    shortName?: string;
    avatar?: string;
    shirtNumber?: number;
    position?: string;
    category?: PositionCategory;
    isCustom?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showNumberBadge?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
};

// Generates stable color hash for consistent visual identity
function getInitials(name: string): string {
  if (!name) return 'XI';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 'md',
  className = '',
  showNumberBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state whenever avatar URL or player changes
  React.useEffect(() => {
    setImageError(false);
  }, [player.avatar, (player as any).id]);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const initials = getInitials(player.shortName || player.name);
  const category = player.category || 'MID';
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.MID;

  const hasPhoto = Boolean(player.avatar && player.avatar.trim() && !imageError);

  return (
    <div
      className={`relative flex-shrink-0 inline-flex items-center justify-center ${className}`}
      title={hasPhoto ? player.name : `${player.name} (No photo available)`}
    >
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-[#181c24] border border-[#262c38] flex items-center justify-center relative shadow-sm select-none`}
      >
        {hasPhoto ? (
          <img
            src={player.avatar}
            alt={player.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Neutral Sleek Fallback Avatar */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1b202a] to-[#11141a] text-slate-200 font-black" title="No photo available">
            <span className="tracking-tighter font-mono leading-none">{initials}</span>
          </div>
        )}
      </div>

      {/* Optional shirt number badge */}
      {showNumberBadge && player.shirtNumber !== undefined && (
        <span className="absolute -bottom-1 -right-1 bg-[#0b0d11] text-slate-100 font-bold text-[9px] px-1 py-0.2 rounded-full border border-[#222834] leading-none shadow">
          #{player.shirtNumber}
        </span>
      )}
    </div>
  );
};
