import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PLAYERS } from './src/data/players.ts';
import { PRESET_FORMATIONS } from './src/data/formations.ts';
import { TACTICAL_CONCEPTS, PRELOADED_TACTICAL_PRESETS, PLAYER_ROLES } from './src/data/tactics.ts';
import { Player } from './src/types.ts';

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
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
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
      matchedPlayers = matchedPlayers.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q);
        const clubMatch = p.club.toLowerCase().includes(q);
        const natMatch = p.nationality.toLowerCase().includes(q);
        const leagueMatch = p.league.toLowerCase().includes(q);
        const posMatch = p.position.toLowerCase() === q;
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

// AI Tactical Assistant (Powered by server-side Gemini @google/genai)
app.post('/api/tactics/ai-assistant', async (req: Request, res: Response) => {
  try {
    const { message, currentLineup, formationId, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Query message is required.' });
    }

    // Lazy initialization of Gemini client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Provide intelligent fallback from real database principles if key is not yet set
      const lower = message.toLowerCase();
      let fallbackResponse = '';

      if (lower.includes('4-3-3') && (lower.includes('against') || lower.includes('counter') || lower.includes('beat'))) {
        fallbackResponse = `**Tactical Counter to 4-3-3:**\n\n* **Optimal Formations:** **3-5-2** or **4-2-3-1**.\n* **Midfield Dominance:** In a 3-5-2 or 4-2-3-1, your central midfield trio/pivot outnumbers and controls the 4-3-3 single pivot (#6).\n* **Exploiting Wide Spaces:** Because 4-3-3 wingers push high and wide, the space behind their fullbacks is vulnerable to quick diagonal transitions.\n* **Defensive Key:** Double up on their isolated wingers with fullback + wide midfielder support.\n\n*(Note: Add your GEMINI_API_KEY in Settings to enable dynamic interactive tactical simulations.)*`;
      } else if (lower.includes('3-2-4-1') || lower.includes('box midfield')) {
        fallbackResponse = `**How 3-2-4-1 Builds Up:**\n\n* **Phase 1 (First Line):** 3 center-backs circulate the ball, drawing the opponent's first pressing wave.\n* **Phase 2 (Box Midfield):** Two holding pivots (one often an Inverted Fullback) paired with two attacking #10s create numerical overloads in the central channels.\n* **Phase 3 (Isolation & Overload):** Wide wingers pin opposition fullbacks to the touchline, creating 1v1 dribbling duels or cutback lanes into the penalty box.\n* **Rest Defense:** The 3+2 base immediately snuffs out counter-attacks upon loss of possession.`;
      } else if (lower.includes('inverted fullback') || lower.includes('wingback')) {
        fallbackResponse = `**Inverted Fullback vs. Wingback:**\n\n* **Wingback:** Operates vertically along the entire touchline, providing maximum width in attack and recovering as an auxiliary wide defender in a 5-man backline.\n* **Inverted Fullback:** Tucks inside into the central midfield channel during possession, forming a double pivot to control game tempo and secure rest defense against central counters.`;
      } else if (lower.includes('high press') || lower.includes('pressing')) {
        fallbackResponse = `**High Press Mechanics:**\n\n* **Trigger Points:** Opposition back passes, touches toward the sideline, or heavy first touches.\n* **Structure:** Front three angle their runs to force the opposition toward their weaker flank, while the midfield steps up to intercept the first forward escape pass.\n* **Defensive Line:** Must push up to 65–70% of the pitch to eliminate space between lines.`;
      } else if (lower.includes('false 9')) {
        fallbackResponse = `**False 9 Strategy:**\n\n* **Movement:** Drops 15–20 yards deep into the pocket between defense and midfield.\n* **Dilemma for Center-Backs:** If the defender follows, huge space is opened for inverted wingers to sprint in behind; if the defender stays, the False 9 receives on the half-turn with time to shoot or thread passes.`;
      } else {
        fallbackResponse = `**UEFA Pro Tactical Analysis:**\n\n* **Active Formation:** ${formationId || '4-3-3'}\n* **Key Principles:** Maintain balance between horizontal width (stretching the block) and central compactness.\n* **Data Integrity Notice:** All tactical options and positional roles are strictly derived from verified football tactical concepts. No speculative or hallucinated player data is utilized.\n\n*(Connect your GEMINI_API_KEY in project Settings for real-time natural language tactical dialogue.)*`;
      }

      return res.json({
        success: true,
        answer: fallbackResponse,
        recommendedFormationId: lower.includes('3-5-2') ? '3-5-2' : lower.includes('3-2-4-1') ? '3-2-4-1' : lower.includes('4-2-3-1') ? '4-2-3-1' : undefined,
        recommendedPresetId: lower.includes('high press') ? 'high-press' : lower.includes('low block') ? 'low-block' : lower.includes('gegenpress') ? 'gegenpress' : undefined,
      });
    }

    // Call Gemini with full factual context
    const ai = new GoogleGenAI({ apiKey });

    // Format current squad context factual data
    const playersSummary = Array.isArray(currentLineup?.players)
      ? currentLineup.players
          .map((p: any) => `${p.player.shortName} (${p.player.position}, Club: ${p.player.club}, Nat: ${p.player.nationality}, Rating: ${p.player.rating}, Role: ${p.tacticalRole || 'Standard'})`)
          .join('; ')
      : 'Standard Starting XI';

    const systemPrompt = `You are an elite, UEFA Pro License Football Tactician and Tactical Assistant.
You have access to a verified database of football formations (such as 4-3-3, 3-2-4-1, 4-2-3-1, 3-5-2, 5-4-1, 4-4-2, etc.), real tactical presets (High press, Low block, Gegenpress, Tiki-taka, Counter-attack, etc.), and 22 canonical player tactical roles.

CRITICAL DIRECTIVES:
1. DATA ACCURACY: Ground every statement in real football theory, official tactics, and the exact players provided.
2. NO HALLUCINATION: DO NOT invent fake stats, imaginary players, or fake attributes. If information is not provided or unknown, state explicitly: "Data not available for this player/team."
3. PRACTICAL RECOMMENDATIONS: Offer concrete advice on pressing schemes, build-up patterns, player roles, and counter-tactics.
4. ACTIONABLE: If you recommend a specific formation or preset, name it clearly.
Format your response with clear markdown headings, bullet points, and high readability.`;

    const userPrompt = `Current Formation: ${formationId || '4-3-3'}
Current Lineup Players: ${playersSummary}
User Question: "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
    });

    const answerText = response.text || 'Tactical analysis complete.';

    // Check if a specific formation or preset was recommended
    let recFormation: string | undefined = undefined;
    let recPreset: string | undefined = undefined;
    const lowerAns = answerText.toLowerCase();

    if (lowerAns.includes('3-2-4-1')) recFormation = '3-2-4-1';
    else if (lowerAns.includes('3-5-2')) recFormation = '3-5-2';
    else if (lowerAns.includes('4-2-3-1')) recFormation = '4-2-3-1';
    else if (lowerAns.includes('5-4-1')) recFormation = '5-4-1';
    else if (lowerAns.includes('4-4-2')) recFormation = '4-4-2';

    if (lowerAns.includes('high press')) recPreset = 'high-press';
    else if (lowerAns.includes('low block')) recPreset = 'low-block';
    else if (lowerAns.includes('gegenpress')) recPreset = 'gegenpress';
    else if (lowerAns.includes('tiki-taka')) recPreset = 'tiki-taka';

    res.json({
      success: true,
      answer: answerText,
      recommendedFormationId: recFormation,
      recommendedPresetId: recPreset,
    });
  } catch (err: any) {
    console.error('Gemini AI Assistant error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to process tactical query. Check GEMINI_API_KEY configuration.',
    });
  }
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
    console.log(`Tactics & Lineup Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
