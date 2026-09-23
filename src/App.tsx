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
  encodeLineupToURL,
  hydrateAndVerifyLineup,
} from './utils/storage';
import { footballApi } from './services/footballApi';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

// Components
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { TacticsEditor } from './components/TacticsEditor';
import { PlayerDatabaseView } from './components/PlayerDatabaseView';
import { LineupManager } from './components/LineupManager';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { CustomPlayerModal } from './components/CustomPlayerModal';
import { LegalModal, LegalTab } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { AdSenseConfigModal } from './components/AdSenseConfigModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tactics');
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [currentLineup, setCurrentLineup] = useState<Lineup>(DEFAULT_LINEUP);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [isSaved, setIsSaved] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomPlayerModalOpen, setIsCustomPlayerModalOpen] = useState(false);
  const [editingCustomPlayer, setEditingCustomPlayer] = useState<Player | null>(null);

  // Legal & AdSense Modals
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');
  const [isAdSenseConfigModalOpen, setIsAdSenseConfigModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleOpenLegal = useCallback((tab: LegalTab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  }, []);

  const handleOpenAdSenseGuide = useCallback(() => {
    setIsAdSenseConfigModalOpen(true);
  }, []);

  const handleOpenContact = useCallback(() => {
    setIsContactModalOpen(true);
  }, []);

  // Load Initial Data from Storage & Check URL for Shared Lineup
  useEffect(() => {
    const checkInitialLineup = async () => {
      // 1. Check if URL is a shared lineup link (/lineup/:id or ?share=:id)
      let shareId = '';
      const path = window.location.pathname;
      if (path.startsWith('/lineup/')) {
        shareId = path.replace('/lineup/', '').split('/')[0].trim();
      } else {
        const params = new URLSearchParams(window.location.search);
        if (params.has('share')) {
          shareId = params.get('share') || '';
        }
      }

      if (shareId) {
        try {
          const shared = await footballApi.getSharedLineup(shareId);
          if (shared) {
            const verified = hydrateAndVerifyLineup(shared);
            setCurrentLineup(verified);
            setActiveTab('tactics');
            return;
          }
        } catch (e) {
          console.warn('Could not load shared lineup by token:', e);
        }
      }

      // 2. Check if URL has encoded lineup data
      const sharedLineup = decodeLineupFromURL();
      if (sharedLineup) {
        setCurrentLineup(sharedLineup);
        setActiveTab('tactics');
      }
    };

    checkInitialLineup();

    // 3. Load Saved Lineups
    const storedLineups = loadSavedLineups();
    setLineups(storedLineups);

    // 4. Load Custom Players
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

  const handleShareLineup = async () => {
    try {
      const res = await footballApi.shareLineup(currentLineup);
      const urlToCopy = res.url || encodeLineupToURL(currentLineup);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy);
      }
      setShareToast('Lineup link copied!');
      setTimeout(() => setShareToast(null), 3000);
      setIsShareModalOpen(true);
    } catch (e) {
      console.error('Error sharing lineup:', e);
      const fallbackUrl = encodeLineupToURL(currentLineup);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fallbackUrl);
      }
      setShareToast('Lineup link copied!');
      setTimeout(() => setShareToast(null), 3000);
      setIsShareModalOpen(true);
    }
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
        onOpenShareModal={handleShareLineup}
        onSaveCurrentLineup={handleSaveCurrentLineup}
        onOpenLegal={handleOpenLegal}
        onOpenAdSenseGuide={handleOpenAdSenseGuide}
        onOpenContact={handleOpenContact}
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
              onOpenLegal={handleOpenLegal}
              onOpenAdSenseGuide={handleOpenAdSenseGuide}
              onOpenContact={handleOpenContact}
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
            onShareLineup={handleShareLineup}
            onOpenAdSenseGuide={handleOpenAdSenseGuide}
            onOpenLegal={handleOpenLegal}
            isSaved={isSaved}
          />
        )}

        {activeTab === 'players' && (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
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
            <Footer
              onOpenLegal={handleOpenLegal}
              onOpenAdSenseGuide={handleOpenAdSenseGuide}
              onOpenContact={handleOpenContact}
            />
          </div>
        )}

        {activeTab === 'lineups' && (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <LineupManager
              lineups={lineups}
              onOpenLineup={handleOpenLineup}
              onCreateNewLineup={handleCreateNewLineup}
              onDuplicateLineup={handleDuplicateLineup}
              onShareLineup={handleShareLineupFromManager}
              onDeleteLineup={handleDeleteLineup}
            />
            <Footer
              onOpenLegal={handleOpenLegal}
              onOpenAdSenseGuide={handleOpenAdSenseGuide}
              onOpenContact={handleOpenContact}
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

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Legal Modal (Privacy Policy, Terms of Service, About, AdSense Transparency) */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* AdSense Setup & Monetization Assistant */}
      <AdSenseConfigModal
        isOpen={isAdSenseConfigModalOpen}
        onClose={() => setIsAdSenseConfigModalOpen(false)}
        onOpenLegalModal={() => {
          setIsAdSenseConfigModalOpen(false);
          handleOpenLegal('privacy');
        }}
      />

      {/* GDPR / CCPA Cookie & Ad Consent Banner */}
      <CookieBanner onOpenPrivacyPolicy={() => handleOpenLegal('privacy')} />

      {/* Share Confirmation Toast */}
      {shareToast && (
        <div
          id="share-notification-toast"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-slate-100 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none"
        >
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
}
