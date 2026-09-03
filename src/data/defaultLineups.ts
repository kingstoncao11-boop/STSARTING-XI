import { Lineup, PitchPlayer } from '../types';
import { requirePlayerById } from './players';

function createPitchSlot(
  instanceId: string,
  playerId: string,
  x: number,
  y: number,
  shirtNumber: number,
  isCaptain: boolean = false
): PitchPlayer {
  const player = requirePlayerById(playerId);
  return {
    instanceId,
    playerId,
    player,
    x,
    y,
    shirtNumber,
    isCaptain,
  };
}

export const DEFAULT_LINEUP: Lineup = {
  id: 'lineup-433-attack',
  title: 'Modern 4-3-3 Attacking Masterclass',
  teamName: 'World XI Elite',
  opponentName: 'Challengers',
  notes: 'High-press possession system with inverted wingers and overlapping fullbacks.',
  formationId: '4-3-3-attack',
  displaySettings: {
    showNames: true,
    showNumbers: true,
    showRatings: true,
    showPositions: true,
    markerStyle: 'avatar',
    pitchTheme: 'classic-grass',
    pitchOrientation: 'vertical',
    teamKitColor: '#10b981',
    teamTextColor: '#ffffff',
    gkKitColor: '#f59e0b',
    gkTextColor: '#000000',
    showGridLines: true,
  },
  players: [
    createPitchSlot('slot-1', '34145514', 50, 92, 1), // Thibaut Courtois
    createPitchSlot('slot-2', '34146597', 86, 74, 2), // Dani Carvajal
    createPitchSlot('slot-3', '34172293', 62, 76, 2), // William Saliba
    createPitchSlot('slot-4', '34147021', 38, 76, 4, true), // Virgil van Dijk (C)
    createPitchSlot('slot-5', '34163481', 14, 74, 23), // Ferland Mendy
    createPitchSlot('slot-6', '34161326', 50, 56, 16), // Rodri
    createPitchSlot('slot-7', '34155057', 68, 44, 17), // Kevin De Bruyne
    createPitchSlot('slot-8', '34171882', 32, 44, 5), // Jude Bellingham
    createPitchSlot('slot-9', '34169884', 84, 24, 7), // Bukayo Saka
    createPitchSlot('slot-10', '34169116', 50, 15, 9), // Erling Haaland
    createPitchSlot('slot-11', '34161324', 16, 24, 7), // Vinícius Júnior
  ],
  bench: [
    createPitchSlot('bench-1', '34163551', 0, 0, 1), // Alisson Becker
    createPitchSlot('bench-2', '34162490', 0, 0, 3), // Rúben Dias
    createPitchSlot('bench-3', '34161331', 0, 0, 8), // Federico Valverde
    createPitchSlot('bench-4', '34173012', 0, 0, 10), // Florian Wirtz
    createPitchSlot('bench-5', '34162098', 0, 0, 9), // Kylian Mbappé
    createPitchSlot('bench-6', '34219490', 0, 0, 19), // Lamine Yamal
  ],
  annotations: [
    {
      id: 'ann-1',
      tool: 'curved-arrow',
      color: '#facc15',
      strokeWidth: 3,
      points: [
        { x: 16, y: 24 },
        { x: 26, y: 18 },
        { x: 38, y: 16 },
      ],
      label: 'Inside Cut',
    },
    {
      id: 'ann-2',
      tool: 'dashed-arrow',
      color: '#38bdf8',
      strokeWidth: 3,
      points: [
        { x: 50, y: 56 },
        { x: 68, y: 44 },
      ],
      label: 'Vertical Link',
    },
  ],
  createdAt: '2026-08-30T10:00:00.000Z',
  updatedAt: '2026-08-31T14:20:00.000Z',
};

export const SAMPLE_SAVED_LINEUPS: Lineup[] = [
  DEFAULT_LINEUP,
  {
    id: 'lineup-pep-box',
    title: 'Guardiola 3-2-4-1 Masterclass',
    teamName: 'Manchester City Style',
    opponentName: 'Arsenal',
    notes: 'Stones/Rodri double pivot in possession with 5 attackers pinning backline.',
    formationId: '3-2-4-1',
    displaySettings: {
      showNames: true,
      showNumbers: true,
      showRatings: true,
      showPositions: true,
      markerStyle: 'avatar',
      pitchTheme: 'tactical-board',
      pitchOrientation: 'vertical',
      teamKitColor: '#38bdf8',
      teamTextColor: '#0f172a',
      gkKitColor: '#f59e0b',
      gkTextColor: '#000000',
      showGridLines: true,
    },
    players: [
      createPitchSlot('p1', '34146911', 50, 92, 31), // Ederson Moraes
      createPitchSlot('p2', '34174542', 26, 76, 24), // Joško Gvardiol
      createPitchSlot('p3', '34162490', 50, 78, 3), // Rúben Dias
      createPitchSlot('p4', '34172293', 74, 76, 2), // William Saliba
      createPitchSlot('p5', '34161326', 38, 60, 16), // Rodri
      createPitchSlot('p6', '34145719', 62, 60, 5), // John Stones
      createPitchSlot('p7', '34161327', 14, 34, 47), // Phil Foden
      createPitchSlot('p8', '34155057', 38, 36, 17, true), // Kevin De Bruyne (C)
      createPitchSlot('p9', '34155543', 62, 36, 20), // Bernardo Silva
      createPitchSlot('p10', '34169884', 86, 34, 7), // Bukayo Saka
      createPitchSlot('p11', '34169116', 50, 16, 9), // Erling Haaland
    ],
    bench: [
      createPitchSlot('b1', '34173874', 0, 0, 19), // Julián Álvarez
      createPitchSlot('b2', '34145509', 0, 0, 9), // Harry Kane
    ],
    annotations: [],
    createdAt: '2026-08-28T14:30:00.000Z',
    updatedAt: '2026-08-29T18:10:00.000Z',
  },
  {
    id: 'lineup-alonso-leverkusen',
    title: 'Xabi Alonso 3-4-2-1 Inverted Attack',
    teamName: 'Leverkusen Invincibles',
    opponentName: 'Bayern Munich',
    notes: 'Grimaldo & Frimpong high width with Wirtz orchestrating between the lines.',
    formationId: '3-4-2-1',
    displaySettings: {
      showNames: true,
      showNumbers: true,
      showRatings: true,
      showPositions: true,
      markerStyle: 'avatar',
      pitchTheme: 'night',
      pitchOrientation: 'vertical',
      teamKitColor: '#ef4444',
      teamTextColor: '#ffffff',
      gkKitColor: '#eab308',
      gkTextColor: '#000000',
      showGridLines: true,
    },
    players: [
      createPitchSlot('a1', '34146350', 50, 92, 1), // Marc-André ter Stegen
      createPitchSlot('a2', '34164134', 26, 76, 95), // Alessandro Bastoni
      createPitchSlot('a3', '34147021', 50, 78, 4, true), // Virgil van Dijk (C)
      createPitchSlot('a4', '34146608', 74, 76, 22), // Antonio Rüdiger
      createPitchSlot('a5', '34159518', 12, 48, 20), // Alejandro Grimaldo
      createPitchSlot('a6', '34154946', 38, 54, 20), // Hakan Çalhanoğlu
      createPitchSlot('a7', '34161584', 62, 54, 41), // Declan Rice
      createPitchSlot('a8', '34172816', 88, 48, 30), // Jeremie Frimpong
      createPitchSlot('a9', '34173012', 34, 32, 10), // Florian Wirtz
      createPitchSlot('a10', '34173062', 66, 32, 42), // Jamal Musiala
      createPitchSlot('a11', '34145509', 50, 16, 9), // Harry Kane
    ],
    bench: [
      createPitchSlot('ab1', '34161328', 0, 0, 29), // Kai Havertz
    ],
    annotations: [],
    createdAt: '2026-08-25T11:15:00.000Z',
    updatedAt: '2026-08-27T09:40:00.000Z',
  },
];
