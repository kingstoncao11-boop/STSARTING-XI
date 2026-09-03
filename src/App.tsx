/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveTab, Lineup, Player, PitchPlayer } from './types';
import { PRELOADED_PLAYERS } from './data/players';
import { DEFAULT_LINEUP, SAMPLE_SAVED_LINEUPS } from './data/defaultLineups';
import {
  loadSavedLineups,
  saveLineupsToStorage,
  saveLineup,
  deleteLineupFromStorage,
  duplicateLineupInStorage,
  loadCustomPlayers,
  saveCustomPlayersToStorage,
  saveCustomPlayer,
  deleteCustomPlayerFromStorage,
  decodeLineupFromURL,
} from './utils/storage';

// Components
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { TacticsEditor } from './components/TacticsEditor';
import { PlayerDatabaseView } from './components/PlayerDatabaseView';
import { LineupManager } from './components/LineupManager';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { CustomPlayerModal } from './components/CustomPlayerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tactics');
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [currentLineup, setCurrentLineup] = useState<Lineup>(DEFAULT_LINEUP);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [isSaved, setIsSaved] = useState(true);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomPlayerModalOpen, setIsCustomPlayerModalOpen] = useState(false);
  const [editingCustomPlayer, setEditingCustomPlayer] = useState<Player | null>(null);

  // Load Initial Data from Storage & Check URL for Shared Lineup
  useEffect(() => {
    // 1. Check if URL has shared tactics data
    const sharedLineup = decodeLineupFromURL();
    if (sharedLineup) {
      setCurrentLineup(sharedLineup);
      setActiveTab('tactics');
    }

    // 2. Load Saved Lineups
    const storedLineups = loadSavedLineups();
    setLineups(storedLineups);

    // 3. Load Custom Players
    const storedCustomPlayers = loadCustomPlayers();
    setCustomPlayers(storedCustomPlayers);
  }, []);

  // Combined Player database (Preloaded + Custom)
  const allPlayers = useMemo(() => {
    return [...customPlayers, ...PRELOADED_PLAYERS];
  }, [customPlayers]);

  // Handle Current Lineup Updates
  const handleUpdateLineup = useCallback((updated: Lineup) => {
    const withTimestamp = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setCurrentLineup(withTimestamp);
    setIsSaved(false);

    // Auto-persist in background
    saveLineup(withTimestamp);
    setLineups((prev) => {
      const idx = prev.findIndex((l) => l.id === withTimestamp.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = withTimestamp;
        return next;
      }
      return [withTimestamp, ...prev];
    });
  }, []);

  // Explicit Save Tactic Button
  const handleSaveCurrentLineup = () => {
    saveLineup(currentLineup);
    setLineups((prev) => {
      const idx = prev.findIndex((l) => l.id === currentLineup.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = currentLineup;
        return next;
      }
      return [currentLineup, ...prev];
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Lineup Manager Actions
  const handleOpenLineup = (lineup: Lineup) => {
    setCurrentLineup(lineup);
    setActiveTab('tactics');
  };

  const handleCreateNewLineup = () => {
    const newLineup: Lineup = {
      id: `lineup-${Date.now()}`,
      title: 'New Starting XI',
      teamName: 'My Team',
      formationId: '4-3-3',
      players: [],
      bench: [],
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displaySettings: {
        pitchTheme: 'emerald',
        pitchOrientation: 'vertical',
        markerStyle: 'avatar',
        showNames: true,
        showNumbers: true,
        showRatings: true,
        showPositions: true,
        teamKitColor: '#10b981',
        teamTextColor: '#ffffff',
        gkKitColor: '#f59e0b',
        gkTextColor: '#000000',
        showGridLines: true,
        showGrid: false,
      },
    };

    saveLineup(newLineup);
    setLineups((prev) => [newLineup, ...prev]);
    setCurrentLineup(newLineup);
    setActiveTab('tactics');
  };

  const handleDuplicateLineup = (id: string) => {
    const duplicated = duplicateLineupInStorage(id);
    if (duplicated) {
      setLineups(loadSavedLineups());
    }
  };

  const handleDeleteLineup = (id: string) => {
    if (confirm('Are you sure you want to delete this lineup?')) {
      deleteLineupFromStorage(id);
      const updated = loadSavedLineups();
      setLineups(updated);
      if (currentLineup.id === id) {
        setCurrentLineup(updated[0] || DEFAULT_LINEUP);
      }
    }
  };

  const handleShareLineupFromManager = (lineup: Lineup) => {
    setCurrentLineup(lineup);
    setIsShareModalOpen(true);
  };

  const handleImportLineup = (imported: Lineup) => {
    const withNewId = {
      ...imported,
      id: `imported-${Date.now()}`,
      title: `${imported.title} (Imported)`,
      updatedAt: new Date().toISOString(),
    };
    saveLineup(withNewId);
    setLineups((prev) => [withNewId, ...prev]);
    setCurrentLineup(withNewId);
    setActiveTab('tactics');
  };

  // Custom Player CRUD
  const handleSaveCustomPlayer = (player: Player) => {
    saveCustomPlayer(player);
    setCustomPlayers(loadCustomPlayers());
    setEditingCustomPlayer(null);
  };

  const handleEditCustomPlayer = (player: Player) => {
    setEditingCustomPlayer(player);
    setIsCustomPlayerModalOpen(true);
  };

  const handleDeleteCustomPlayer = (id: string) => {
    if (confirm('Delete this custom player?')) {
      deleteCustomPlayerFromStorage(id);
      setCustomPlayers(loadCustomPlayers());
    }
  };

  // Add to Starting XI from Database View
  const handleAddPlayerFromDatabase = (player: Player) => {
    const isAlreadyOnPitch = currentLineup.players.some((p) => p.player.id === player.id);
    if (isAlreadyOnPitch) return;

    const newPitchPlayer: PitchPlayer = {
      instanceId: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      playerId: player.id,
      player,
      x: 50,
      y: 50,
      shirtNumber: player.shirtNumber,
      isCaptain: false,
    };

    handleUpdateLineup({
      ...currentLineup,
      players: [...currentLineup.players, newPitchPlayer],
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onSaveCurrentLineup={handleSaveCurrentLineup}
        isSaved={isSaved}
      />

      {/* Main Views */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto">
            <Home
              onNavigate={setActiveTab}
              onSelectLineupTemplate={(tpl) => {
                handleOpenLineup(tpl);
              }}
            />
          </div>
        )}

        {activeTab === 'tactics' && (
          <TacticsEditor
            currentLineup={currentLineup}
            allPlayers={allPlayers}
            onUpdateLineup={handleUpdateLineup}
            onOpenCreateCustomPlayer={() => {
              setEditingCustomPlayer(null);
              setIsCustomPlayerModalOpen(true);
            }}
            onEditCustomPlayer={handleEditCustomPlayer}
            onDeleteCustomPlayer={handleDeleteCustomPlayer}
            onSaveLineup={handleSaveCurrentLineup}
            isSaved={isSaved}
          />
        )}

        {activeTab === 'players' && (
          <div className="flex-1 overflow-y-auto">
            <PlayerDatabaseView
              allPlayers={allPlayers}
              onAddToLineup={handleAddPlayerFromDatabase}
              onOpenCreateCustomPlayer={() => {
                setEditingCustomPlayer(null);
                setIsCustomPlayerModalOpen(true);
              }}
              onEditCustomPlayer={handleEditCustomPlayer}
              onDeleteCustomPlayer={handleDeleteCustomPlayer}
            />
          </div>
        )}

        {activeTab === 'lineups' && (
          <div className="flex-1 overflow-y-auto">
            <LineupManager
              lineups={lineups}
              onOpenLineup={handleOpenLineup}
              onCreateNewLineup={handleCreateNewLineup}
              onDuplicateLineup={handleDuplicateLineup}
              onShareLineup={handleShareLineupFromManager}
              onDeleteLineup={handleDeleteLineup}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          lineup={currentLineup}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          lineup={currentLineup}
          onImportLineup={handleImportLineup}
        />
      )}

      {isCustomPlayerModalOpen && (
        <CustomPlayerModal
          isOpen={isCustomPlayerModalOpen}
          onClose={() => {
            setIsCustomPlayerModalOpen(false);
            setEditingCustomPlayer(null);
          }}
          onSavePlayer={handleSaveCustomPlayer}
          editingPlayer={editingCustomPlayer}
        />
      )}
    </div>
  );
}
