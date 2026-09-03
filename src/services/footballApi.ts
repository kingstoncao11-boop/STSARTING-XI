import { Player, Formation, TacticalConcept, TacticalPreset, TacticalRoleDefinition, Lineup } from '../types';
import { INITIAL_PLAYERS } from '../data/players';
import { PRESET_FORMATIONS } from '../data/formations';
import { TACTICAL_CONCEPTS, PRELOADED_TACTICAL_PRESETS, PLAYER_ROLES } from '../data/tactics';

export interface PlayerSearchParams {
  q?: string;
  position?: string;
  category?: string;
  club?: string;
  nationality?: string;
  league?: string;
  limit?: number;
}

export interface AssistantResponse {
  success: boolean;
  answer: string;
  recommendedFormationId?: string;
  recommendedPresetId?: string;
  error?: string;
}

export const footballApi = {
  // Search players via server backend (proxies to API-Football when keys are set)
  async searchPlayers(params: PlayerSearchParams = {}): Promise<Player[]> {
    try {
      const urlParams = new URLSearchParams();
      if (params.q) urlParams.set('q', params.q);
      if (params.position) urlParams.set('position', params.position);
      if (params.category) urlParams.set('category', params.category);
      if (params.club) urlParams.set('club', params.club);
      if (params.nationality) urlParams.set('nationality', params.nationality);
      if (params.league) urlParams.set('league', params.league);
      if (params.limit) urlParams.set('limit', String(params.limit));

      const res = await fetch(`/api/players/search?${urlParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.players)) {
          return data.players;
        }
      }
    } catch (err) {
      console.warn('Backend player search failed, using client fallback database:', err);
    }

    // Client-side fallback to verified canonical dataset
    let list = [...INITIAL_PLAYERS];
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          p.club.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q) ||
          p.position.toLowerCase() === q
      );
    }
    if (params.position) {
      list = list.filter((p) => p.position === params.position);
    }
    if (params.category) {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.club) {
      list = list.filter((p) => p.club.toLowerCase().includes(params.club!.toLowerCase()));
    }
    if (params.nationality) {
      list = list.filter((p) => p.nationality.toLowerCase().includes(params.nationality!.toLowerCase()));
    }
    if (params.league) {
      list = list.filter((p) => p.league.toLowerCase().includes(params.league!.toLowerCase()));
    }
    return list.slice(0, params.limit || 50);
  },

  // Get player by ID
  async getPlayerById(id: string): Promise<Player | null> {
    try {
      const res = await fetch(`/api/players/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.player) {
          return data.player;
        }
      }
    } catch (err) {
      console.warn('Backend getPlayerById failed, using client fallback:', err);
    }
    return INITIAL_PLAYERS.find((p) => p.id === id) || null;
  },

  // Get formations
  async getFormations(): Promise<Formation[]> {
    try {
      const res = await fetch('/api/formations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.formations)) {
          return data.formations;
        }
      }
    } catch (e) {
      // ignore fallback
    }
    return PRESET_FORMATIONS;
  },

  // Get tactical concepts
  async getTacticalConcepts(): Promise<TacticalConcept[]> {
    try {
      const res = await fetch('/api/tactics/concepts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.concepts)) {
          return data.concepts;
        }
      }
    } catch (e) {
      // ignore
    }
    return TACTICAL_CONCEPTS;
  },

  // Get tactical presets
  async getTacticalPresets(): Promise<TacticalPreset[]> {
    try {
      const res = await fetch('/api/tactics/presets');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.presets)) {
          return data.presets;
        }
      }
    } catch (e) {
      // ignore
    }
    return PRELOADED_TACTICAL_PRESETS;
  },

  // Get tactical player roles
  async getTacticalRoles(): Promise<TacticalRoleDefinition[]> {
    try {
      const res = await fetch('/api/tactics/roles');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.roles)) {
          return data.roles;
        }
      }
    } catch (e) {
      // ignore
    }
    return PLAYER_ROLES;
  },

  // AI Tactical Assistant consultation
  async askTacticalAssistant(
    message: string,
    currentLineup?: Lineup,
    formationId?: string
  ): Promise<AssistantResponse> {
    try {
      const res = await fetch('/api/tactics/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, currentLineup, formationId }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          answer: data.answer || 'Analysis completed.',
          recommendedFormationId: data.recommendedFormationId,
          recommendedPresetId: data.recommendedPresetId,
        };
      }
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        answer: '',
        error: errJson.error || 'Server error communicating with AI Assistant.',
      };
    } catch (err: any) {
      return {
        success: false,
        answer: '',
        error: 'Network error connecting to backend AI Assistant.',
      };
    }
  },
};
