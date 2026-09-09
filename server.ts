import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PLAYERS } from './src/data/players.ts';
import { PRESET_FORMATIONS } from './src/data/formations.ts';
import { TACTICAL_CONCEPTS, PRELOADED_TACTICAL_PRESETS, PLAYER_ROLES } from './src/data/tactics.ts';
import { Player, Lineup } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for API-Football calls to preserve rate limits
const apiFootballCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

// Helper to query API-Football if API key is configured
async function fetchFromApiFootball(endpoint: string, params: Record<string, string>): Promise<any | null> {
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  const urlParams = new URLSearchParams(params).toString();
  const cacheKey = `${endpoint}?${urlParams}`;
  const cached = apiFootballCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const isRapidApi = Boolean(process.env.RAPIDAPI_KEY && !process.env.API_FOOTBALL_KEY);
    const host = isRapidApi ? 'api-football-v1.p.rapidapi.com' : 'v3.football.api-sports.io';
    const baseUrl = `https://${host}/${endpoint}?${urlParams}`;

    const headers: Record<string, string> = isRapidApi
      ? {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': host,
        }
      : {
          'x-apisports-key': apiKey,
        };

    const res = await fetch(baseUrl, { headers });
    if (!res.ok) {
      console.warn(`API-Football responded with HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (json.response) {
      apiFootballCache.set(cacheKey, { timestamp: Date.now(), data: json.response });
      return json.response;
    }
  } catch (err) {
    console.error('API-Football request error:', err);
  }
  return null;
}

// -----------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    apiFootballConfigured: Boolean(process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY),
  });
});

// -----------------------------------------------------------------
// ANONYMOUS PERSISTENT LINEUP SHARING
// -----------------------------------------------------------------
const SHARED_LINEUPS_FILE = path.join(process.cwd(), 'data', 'shared_lineups.json');
let sharedLineupsStore: Record<string, { lineup: Lineup; createdAt: string }> = {};

function initSharedLineups() {
  try {
    const dir = path.dirname(SHARED_LINEUPS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(SHARED_LINEUPS_FILE)) {
      const data = fs.readFileSync(SHARED_LINEUPS_FILE, 'utf8');
      sharedLineupsStore = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Initialized shared lineups store (in-memory):', err);
    sharedLineupsStore = {};
  }
}
initSharedLineups();

function persistSharedLineups() {
  try {
    const dir = path.dirname(SHARED_LINEUPS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SHARED_LINEUPS_FILE, JSON.stringify(sharedLineupsStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write shared lineups to disk:', err);
  }
}

// Generate URL-safe random token (e.g. "k9x2m4q8")
function generateShareToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 9; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create anonymous shared lineup
app.post('/api/lineups/share', (req: Request, res: Response) => {
  try {
    const { lineup } = req.body;
    if (!lineup || !Array.isArray(lineup.players)) {
      return res.status(400).json({ success: false, error: 'Invalid lineup payload' });
    }

    let shareId = generateShareToken();
    while (sharedLineupsStore[shareId]) {
      shareId = generateShareToken();
    }

    sharedLineupsStore[shareId] = {
      lineup,
      createdAt: new Date().toISOString(),
    };
    persistSharedLineups();

    return res.json({
      success: true,
      shareId,
      url: `/lineup/${shareId}`,
    });
  } catch (err: any) {
    console.error('Error sharing lineup:', err);
    return res.status(500).json({ success: false, error: 'Failed to share lineup' });
  }
});

// Retrieve anonymous shared lineup
app.get('/api/lineups/shared/:shareId', (req: Request, res: Response) => {
  const { shareId } = req.params;
  const record = sharedLineupsStore[shareId];
  if (!record) {
    return res.status(404).json({ success: false, error: 'Lineup not found' });
  }
  return res.json({
    success: true,
    lineup: record.lineup,
    createdAt: record.createdAt,
  });
});

// Search players with strict canonical accuracy
app.get('/api/players/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    const position = (req.query.position as string || '').trim().toUpperCase();
    const category = (req.query.category as string || '').trim().toUpperCase();
    const club = (req.query.club as string || '').trim().toLowerCase();
    const nationality = (req.query.nationality as string || '').trim().toLowerCase();
    const league = (req.query.league as string || '').trim().toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

    let matchedPlayers: Player[] = [...INITIAL_PLAYERS];

    // If query provided and user requested external API search with key available
    if (q && q.length >= 3 && (process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY)) {
      const apiResults = await fetchFromApiFootball('players', { search: q });
      if (Array.isArray(apiResults) && apiResults.length > 0) {
        const transformed: Player[] = apiResults.map((item: any) => {
          const p = item.player;
          const stats = item.statistics?.[0] || {};
          const posStr = (stats.games?.position || '').toUpperCase();
          let pos: any = 'CM';
          let cat: any = 'MID';

          if (posStr.includes('GOAL') || posStr === 'G') {
            pos = 'GK';
            cat = 'GK';
          } else if (posStr.includes('DEF') || posStr === 'D') {
            pos = 'CB';
            cat = 'DEF';
          } else if (posStr.includes('ATT') || posStr === 'A' || posStr.includes('FOR')) {
            pos = 'ST';
            cat = 'ATT';
          }

          return {
            id: String(p.id),
            name: p.name || `${p.firstname || ''} ${p.lastname || ''}`.trim(),
            shortName: p.name || p.lastname || 'Player',
            position: pos,
            category: cat,
            secondaryPositions: [],
            club: stats.team?.name || 'Club',
            clubId: stats.team?.id,
            clubLogo: stats.team?.logo,
            league: stats.league?.name || 'League',
            nationality: p.nationality || 'Unknown',
            nationalityFlag: stats.league?.flag,
            shirtNumber: stats.games?.number || 9,
            rating: Math.round(parseFloat(stats.games?.rating || '7.0') * 10) || 82,
            avatar: p.photo || `https://media.api-sports.io/football/players/${p.id}.png`,
            age: p.age,
            height: p.height,
            weight: p.weight,
            stats: {
              appearances: stats.games?.appearences || 0,
              goals: stats.goals?.total || 0,
              assists: stats.goals?.assists || 0,
              cleanSheets: stats.goals?.conceded === 0 ? 1 : 0,
              yellowCards: stats.cards?.yellow || 0,
              redCards: stats.cards?.red || 0,
              rating: parseFloat(stats.games?.rating || '7.2') || 7.2,
            },
          };
        });

        // Merge into matched players ensuring uniqueness by canonical ID
        const existingIds = new Set(matchedPlayers.map((p) => p.id));
        for (const tp of transformed) {
          if (!existingIds.has(tp.id)) {
            matchedPlayers.push(tp);
            existingIds.add(tp.id);
          }
        }
      }
    }

    // Apply strict filtering
    if (q) {
      const norm = (s: string) =>
        (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ø]/g, 'o').replace(/[æ]/g, 'ae');
      const normQ = norm(q);
      matchedPlayers = matchedPlayers.filter((p) => {
        const nameMatch = norm(p.name).includes(normQ) || norm(p.shortName).includes(normQ);
        const clubMatch = norm(p.club).includes(normQ);
        const natMatch = norm(p.nationality).includes(normQ);
        const leagueMatch = norm(p.league).includes(normQ);
        const posMatch = p.position.toLowerCase() === q.toLowerCase();
        return nameMatch || clubMatch || natMatch || leagueMatch || posMatch;
      });
    }

    if (position) {
      matchedPlayers = matchedPlayers.filter(
        (p) => p.position === position || p.secondaryPositions?.includes(position as any)
      );
    }

    if (category) {
      matchedPlayers = matchedPlayers.filter((p) => p.category === category);
    }

    if (club) {
      matchedPlayers = matchedPlayers.filter((p) => p.club.toLowerCase().includes(club));
    }

    if (nationality) {
      matchedPlayers = matchedPlayers.filter((p) => p.nationality.toLowerCase().includes(nationality));
    }

    if (league) {
      matchedPlayers = matchedPlayers.filter((p) => p.league.toLowerCase().includes(league));
    }

    res.json({
      success: true,
      total: matchedPlayers.length,
      players: matchedPlayers.slice(0, limit),
    });
  } catch (error: any) {
    console.error('Error in /api/players/search:', error);
    res.status(500).json({ success: false, error: 'Internal server error while searching players.' });
  }
});

// Single player canonical lookup
app.get('/api/players/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const player = INITIAL_PLAYERS.find((p) => p.id === id);
  if (player) {
    return res.json({ success: true, player });
  }

  // Check API-Football if key present
  if (process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY) {
    const apiResult = await fetchFromApiFootball('players', { id });
    if (Array.isArray(apiResult) && apiResult.length > 0) {
      const item = apiResult[0];
      const p = item.player;
      const stats = item.statistics?.[0] || {};
      const posStr = (stats.games?.position || '').toUpperCase();
      let pos: any = 'CM';
      let cat: any = 'MID';

      if (posStr.includes('GOAL') || posStr === 'G') {
        pos = 'GK';
        cat = 'GK';
      } else if (posStr.includes('DEF') || posStr === 'D') {
        pos = 'CB';
        cat = 'DEF';
      } else if (posStr.includes('ATT') || posStr === 'A' || posStr.includes('FOR')) {
        pos = 'ST';
        cat = 'ATT';
      }

      const externalPlayer: Player = {
        id: String(p.id),
        name: p.name || `${p.firstname || ''} ${p.lastname || ''}`.trim(),
        shortName: p.name || p.lastname || 'Player',
        position: pos,
        category: cat,
        secondaryPositions: [],
        club: stats.team?.name || 'Club',
        clubId: stats.team?.id,
        clubLogo: stats.team?.logo,
        league: stats.league?.name || 'League',
        nationality: p.nationality || 'Unknown',
        nationalityFlag: stats.league?.flag,
        shirtNumber: stats.games?.number || 9,
        rating: Math.round(parseFloat(stats.games?.rating || '7.0') * 10) || 82,
        avatar: p.photo || `https://media.api-sports.io/football/players/${p.id}.png`,
        age: p.age,
        height: p.height,
        weight: p.weight,
        stats: {
          appearances: stats.games?.appearences || 0,
          goals: stats.goals?.total || 0,
          assists: stats.goals?.assists || 0,
          cleanSheets: stats.goals?.conceded === 0 ? 1 : 0,
          yellowCards: stats.cards?.yellow || 0,
          redCards: stats.cards?.red || 0,
          rating: parseFloat(stats.games?.rating || '7.2') || 7.2,
        },
      };
      return res.json({ success: true, player: externalPlayer });
    }
  }

  return res.status(404).json({
    success: false,
    message: 'Player not found. No verified record in database.',
  });
});

// Real Formations
app.get('/api/formations', (req: Request, res: Response) => {
  res.json({ success: true, formations: PRESET_FORMATIONS });
});

// Real Tactical Concepts
app.get('/api/tactics/concepts', (req: Request, res: Response) => {
  res.json({ success: true, concepts: TACTICAL_CONCEPTS });
});

// Real Tactical Presets
app.get('/api/tactics/presets', (req: Request, res: Response) => {
  res.json({ success: true, presets: PRELOADED_TACTICAL_PRESETS });
});

// Real Player Roles
app.get('/api/tactics/roles', (req: Request, res: Response) => {
  res.json({ success: true, roles: PLAYER_ROLES });
});

// -----------------------------------------------------------------
// VITE MIDDLEWARE / PRODUCTION SERVING
// -----------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
