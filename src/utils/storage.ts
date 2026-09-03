import { Lineup, PitchPlayer, Player } from '../types';
import { SAMPLE_SAVED_LINEUPS, DEFAULT_LINEUP } from '../data/defaultLineups';
import { INITIAL_PLAYERS, getPlayerById, requirePlayerById } from '../data/players';

const LINEUPS_STORAGE_KEY = 'startingxi_saved_lineups_v4';
const CUSTOM_PLAYERS_STORAGE_KEY = 'startingxi_custom_players_v2';

/**
 * Strict Architectural Enforcement:
 * Ensures every PitchPlayer has a valid, verified playerId pointing to the exact
 * database record with its matching photo_url.
 * NEVER allows a player to display another player's photo.
 */
export function hydrateAndVerifyPitchPlayer(pitchPlayer: PitchPlayer): PitchPlayer {
  const candidateId = pitchPlayer.playerId || pitchPlayer.player?.id;
  
  if (candidateId) {
    const verified = getPlayerById(candidateId);
    if (verified) {
      return {
        ...pitchPlayer,
        playerId: verified.id,
        player: verified,
      };
    }
  }

  // If player is a user-created custom player, preserve it
  if (pitchPlayer.player?.isCustom) {
    const customId = pitchPlayer.player.id || ('custom-' + pitchPlayer.instanceId);
    return {
      ...pitchPlayer,
      playerId: customId,
      player: {
        ...pitchPlayer.player,
        id: customId,
      },
    };
  }

  // Check if player name exactly matches a known canonical player
  if (pitchPlayer.player?.name) {
    const matchedByName = INITIAL_PLAYERS.find(
      (p) => p.name.toLowerCase() === pitchPlayer.player.name.toLowerCase()
    );
    if (matchedByName) {
      return {
        ...pitchPlayer,
        playerId: matchedByName.id,
        player: matchedByName,
      };
    }
  }

  // Safe fallback: clean neutral slot with NO incorrect photo
  const fallbackId = candidateId || pitchPlayer.instanceId;
  return {
    ...pitchPlayer,
    playerId: fallbackId,
    player: {
      id: fallbackId,
      name: pitchPlayer.player?.name || 'Player',
      shortName: pitchPlayer.player?.shortName || 'Player',
      position: pitchPlayer.player?.position || 'CM',
      category: pitchPlayer.player?.category || 'MID',
      secondaryPositions: pitchPlayer.player?.secondaryPositions || [],
      club: pitchPlayer.player?.club || 'Free Agent',
      league: pitchPlayer.player?.league || 'None',
      nationality: pitchPlayer.player?.nationality || 'World',
      shirtNumber: pitchPlayer.shirtNumber || 0,
      rating: pitchPlayer.player?.rating || 75,
      avatar: '', // Crucial: No photo available placeholder, NEVER wrong player photo
    },
  };
}

export function hydrateAndVerifyLineup(lineup: Lineup): Lineup {
  return {
    ...lineup,
    players: (lineup.players || []).map(hydrateAndVerifyPitchPlayer),
    bench: (lineup.bench || []).map(hydrateAndVerifyPitchPlayer),
  };
}

export function getStoredLineups(): Lineup[] {
  try {
    const raw = localStorage.getItem(LINEUPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(SAMPLE_SAVED_LINEUPS));
      return SAMPLE_SAVED_LINEUPS.map(hydrateAndVerifyLineup);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(hydrateAndVerifyLineup);
    }
    return SAMPLE_SAVED_LINEUPS.map(hydrateAndVerifyLineup);
  } catch (err) {
    console.error('Failed to load lineups from storage:', err);
    return SAMPLE_SAVED_LINEUPS.map(hydrateAndVerifyLineup);
  }
}

export function saveLineupToStorage(lineup: Lineup): Lineup[] {
  const verifiedLineup = hydrateAndVerifyLineup(lineup);
  const current = getStoredLineups();
  const existingIdx = current.findIndex((l) => l.id === verifiedLineup.id);
  let updated: Lineup[];

  const withTimestamp = {
    ...verifiedLineup,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = withTimestamp;
  } else {
    updated = [withTimestamp, ...current];
  }

  try {
    localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save lineups to storage:', err);
  }
  return updated;
}

export function deleteLineupFromStorage(id: string): Lineup[] {
  const current = getStoredLineups();
  const updated = current.filter((l) => l.id !== id);
  try {
    localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete lineup:', err);
  }
  return updated;
}

export function duplicateLineupInStorage(id: string): Lineup | null {
  const current = getStoredLineups();
  const target = current.find((l) => l.id === id);
  if (!target) return null;

  const duplicated: Lineup = hydrateAndVerifyLineup({
    ...target,
    id: `lineup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${target.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const updated = [duplicated, ...current];
  try {
    localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to duplicate lineup:', err);
  }
  return duplicated;
}

export function getStoredCustomPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom players:', err);
    return [];
  }
}

export function saveCustomPlayerToStorage(player: Player): Player[] {
  const current = getStoredCustomPlayers();
  const idx = current.findIndex((p) => p.id === player.id);
  let updated: Player[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = player;
  } else {
    updated = [player, ...current];
  }
  try {
    localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom player:', err);
  }
  return updated;
}

export function deleteCustomPlayerFromStorage(id: string): Player[] {
  const current = getStoredCustomPlayers();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom player:', err);
  }
  return updated;
}

export const loadSavedLineups = getStoredLineups;
export const saveLineup = saveLineupToStorage;
export const saveLineupsToStorage = (lineups: Lineup[]) => {
  localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(lineups.map(hydrateAndVerifyLineup)));
};
export const loadCustomPlayers = getStoredCustomPlayers;
export const saveCustomPlayer = saveCustomPlayerToStorage;
export const saveCustomPlayersToStorage = (players: Player[]) => {
  localStorage.setItem(CUSTOM_PLAYERS_STORAGE_KEY, JSON.stringify(players));
};

// Encode Lineup for Sharing in URL
export function encodeLineupToURL(lineup: Lineup): string {
  try {
    const verified = hydrateAndVerifyLineup(lineup);
    const json = JSON.stringify(verified);
    const encoded = btoa(encodeURIComponent(json));
    const url = new URL(window.location.href);
    url.searchParams.set('lineup', encoded);
    return url.toString();
  } catch (e) {
    console.error('Error encoding lineup:', e);
    return window.location.href;
  }
}

export function decodeLineupFromURL(): Lineup | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('lineup');
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);
    if (parsed && parsed.players && Array.isArray(parsed.players)) {
      return hydrateAndVerifyLineup(parsed as Lineup);
    }
    return null;
  } catch (e) {
    console.error('Error decoding lineup from URL:', e);
    return null;
  }
}
