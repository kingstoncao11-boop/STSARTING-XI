import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lineup,
  Player,
  PitchPlayer,
  Formation,
  Annotation,
  AnnotationTool,
  MarkerStyle,
  PitchTheme,
  PitchOrientation,
} from '../types';
import { FootballPitch } from './FootballPitch';
import { FormationSelector } from './FormationSelector';
import { AnnotationToolbar } from './AnnotationToolbar';
import { PlayerSearch } from './PlayerSearch';
import { PlayerEditor } from './PlayerEditor';
import { Bench } from './Bench';
import { getFormationById, PRESET_FORMATIONS } from '../data/formations';
import { getCategoryFromPosition } from '../data/players';
import { TacticalOptionsPanel } from './TacticalOptionsPanel';
import { AiTacticalAssistant } from './AiTacticalAssistant';
import { TacticalPreset } from '../types';
import {
  Settings,
  Shield,
  Pencil,
  RotateCcw,
  Trash2,
  Sliders,
  Palette,
  Users,
  Search,
  Check,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Footprints,
  ArrowRight,
  Split,
  Minus,
  Circle as CircleIcon,
  Square,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Grid,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TacticsEditorProps {
  currentLineup: Lineup;
  allPlayers: Player[];
  onUpdateLineup: (updated: Lineup) => void;
  onOpenCreateCustomPlayer: () => void;
  onEditCustomPlayer: (player: Player) => void;
  onDeleteCustomPlayer: (id: string) => void;
  onSaveLineup: () => void;
  isSaved?: boolean;
}

export const TacticsEditor: React.FC<TacticsEditorProps> = ({
  currentLineup,
  allPlayers,
  onUpdateLineup,
  onOpenCreateCustomPlayer,
  onEditCustomPlayer,
  onDeleteCustomPlayer,
  onSaveLineup,
  isSaved = false,
}) => {
  // Full-screen presentation mode state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenBench, setShowFullscreenBench] = useState(false);

  // Active selected player on pitch or bench
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Annotation states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('curved-arrow');
  const [annotationColor, setAnnotationColor] = useState('#facc15');
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState(3);
  const [annotationHistory, setAnnotationHistory] = useState<Annotation[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Annotation[][]>([]);

  // Mobile active drawer ('none' | 'formations' | 'annotations' | 'search' | 'settings' | 'bench')
  const [mobileActiveDrawer, setMobileActiveDrawer] = useState<
    'none' | 'formations' | 'annotations' | 'search' | 'settings' | 'bench'
  >('none');

  // Desktop sidebar collapse states for expanding pitch view
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Display Settings modal / drawer toggle on desktop
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Tactical Presets & Real Concepts panel
  const [showTacticalOptions, setShowTacticalOptions] = useState(false);

  // AI Tactical Assistant panel
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Fullscreen event listener to sync with native exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        // Attempt native fullscreen if permitted by container environment
        try {
          document.documentElement?.requestFullscreen?.().catch(() => {});
        } catch {
          // Fallback seamlessly to in-app full-viewport overlay
        }
      } else {
        if (document.fullscreenElement) {
          try {
            document.exitFullscreen?.().catch(() => {});
          } catch {}
        }
      }
      return next;
    });
  }, []);

  // Helper to find selected pitch player
  const selectedPitchPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return (
      currentLineup.players.find((p) => p.instanceId === selectedPlayerId) ||
      currentLineup.bench.find((p) => p.instanceId === selectedPlayerId) ||
      null
    );
  }, [selectedPlayerId, currentLineup.players, currentLineup.bench]);

  // Set of player IDs currently on pitch or bench
  const pitchPlayerIds = useMemo(
    () => new Set(currentLineup.players.map((p) => p.player.id)),
    [currentLineup.players]
  );
  const benchPlayerIds = useMemo(
    () => new Set(currentLineup.bench.map((p) => p.player.id)),
    [currentLineup.bench]
  );

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input/textarea/select, don't trigger shortcuts
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
          if (document.fullscreenElement) {
            try {
              document.exitFullscreen?.().catch(() => {});
            } catch {}
          }
        }
        setSelectedPlayerId(null);
        setMobileActiveDrawer('none');
        setShowSettingsDrawer(false);
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDrawingMode(true);
      } else if (e.key === 'v' || e.key === 'V') {
        setIsDrawingMode(false);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && selectedPlayerId) {
        handleRemovePlayer(selectedPlayerId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndoAnnotation();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedoAnnotation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlayerId, isFullscreen, annotationHistory, redoHistory, toggleFullscreen]);

  // --- PLAYER POSITION & LINEUP UPDATES ---
  const handleUpdatePlayerPosition = (instanceId: string, x: number, y: number) => {
    const updatedPlayers = currentLineup.players.map((p) =>
      p.instanceId === instanceId ? { ...p, x, y } : p
    );
    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
    });
  };

  const handleUpdatePlayer = (instanceId: string, updates: Partial<PitchPlayer>) => {
    // Check if player is on pitch
    const onPitchIdx = currentLineup.players.findIndex((p) => p.instanceId === instanceId);
    if (onPitchIdx >= 0) {
      const updatedPlayers = [...currentLineup.players];
      updatedPlayers[onPitchIdx] = { ...updatedPlayers[onPitchIdx], ...updates };
      onUpdateLineup({ ...currentLineup, players: updatedPlayers });
      return;
    }

    // Check if player is on bench
    const onBenchIdx = currentLineup.bench.findIndex((p) => p.instanceId === instanceId);
    if (onBenchIdx >= 0) {
      const updatedBench = [...currentLineup.bench];
      updatedBench[onBenchIdx] = { ...updatedBench[onBenchIdx], ...updates };
      onUpdateLineup({ ...currentLineup, bench: updatedBench });
    }
  };

  const handleSetCaptain = (instanceId: string) => {
    const updatedPlayers = currentLineup.players.map((p) => ({
      ...p,
      isCaptain: p.instanceId === instanceId ? !p.isCaptain : false,
    }));
    onUpdateLineup({ ...currentLineup, players: updatedPlayers });
  };

  const handleRemovePlayer = (instanceId: string) => {
    const updatedPlayers = currentLineup.players.filter((p) => p.instanceId !== instanceId);
    const updatedBench = currentLineup.bench.filter((p) => p.instanceId !== instanceId);
    setSelectedPlayerId(null);
    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
  };

  const handleMoveToBench = (instanceId: string) => {
    const targetPlayer = currentLineup.players.find((p) => p.instanceId === instanceId);
    if (!targetPlayer) return;

    const updatedPlayers = currentLineup.players.filter((p) => p.instanceId !== instanceId);
    const updatedBench = [
      ...currentLineup.bench,
      { ...targetPlayer, instanceId: `bench-${Date.now()}` },
    ];
    setSelectedPlayerId(null);
    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
  };

  const handleMoveBenchToPitch = (benchInstanceId: string) => {
    const target = currentLineup.bench.find((p) => p.instanceId === benchInstanceId);
    if (!target) return;

    // Place at center pitch or find empty formation slot
    const formation = getFormationById(currentLineup.formationId);
    const usedPositions = new Set(currentLineup.players.map((p) => p.player.position));
    const matchingSlot = formation.slots.find((s) => !usedPositions.has(s.position)) || {
      x: 50,
      y: 50,
    };

    const newPitchPlayer: PitchPlayer = {
      ...target,
      instanceId: `slot-${Date.now()}`,
      x: matchingSlot.x,
      y: matchingSlot.y,
    };

    const updatedBench = currentLineup.bench.filter((p) => p.instanceId !== benchInstanceId);
    const updatedPlayers = [...currentLineup.players, newPitchPlayer];

    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
    setSelectedPlayerId(newPitchPlayer.instanceId);
  };

  const handleRemoveFromBench = (benchInstanceId: string) => {
    const updatedBench = currentLineup.bench.filter((p) => p.instanceId !== benchInstanceId);
    if (selectedPlayerId === benchInstanceId) setSelectedPlayerId(null);
    onUpdateLineup({ ...currentLineup, bench: updatedBench });
  };

  // Add from search to Pitch
  const handleAddPlayerToPitch = (player: Player) => {
    // Check if already on pitch
    if (pitchPlayerIds.has(player.id)) {
      // Find and select it
      const existing = currentLineup.players.find((p) => p.player.id === player.id);
      if (existing) setSelectedPlayerId(existing.instanceId);
      return;
    }

    const formation = getFormationById(currentLineup.formationId);
    // Find optimal slot on pitch based on position
    const currentCount = currentLineup.players.length;
    let targetX = 50;
    let targetY = 50;

    if (currentCount < formation.slots.length) {
      targetX = formation.slots[currentCount].x;
      targetY = formation.slots[currentCount].y;
    } else {
      // Dynamic cluster based on position category
      if (player.position === 'GK') {
        targetX = 50;
        targetY = 92;
      } else if (player.category === 'DEF') {
        targetX = 20 + Math.random() * 60;
        targetY = 74;
      } else if (player.category === 'MID') {
        targetX = 25 + Math.random() * 50;
        targetY = 50;
      } else {
        targetX = 20 + Math.random() * 60;
        targetY = 22;
      }
    }

    const newPitchPlayer: PitchPlayer = {
      instanceId: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      playerId: player.id,
      player,
      x: targetX,
      y: targetY,
      shirtNumber: player.shirtNumber,
      isCaptain: false,
    };

    // If was on bench, remove from bench
    const updatedBench = currentLineup.bench.filter((p) => p.player.id !== player.id);
    const updatedPlayers = [...currentLineup.players, newPitchPlayer];

    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
    setSelectedPlayerId(newPitchPlayer.instanceId);
  };

  // Add from search to Bench
  const handleAddPlayerToBench = (player: Player) => {
    if (benchPlayerIds.has(player.id)) return;

    const newBenchPlayer: PitchPlayer = {
      instanceId: `bench-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      playerId: player.id,
      player,
      x: 0,
      y: 0,
      shirtNumber: player.shirtNumber,
      isCaptain: false,
    };

    // If was on pitch, remove from pitch
    const updatedPlayers = currentLineup.players.filter((p) => p.player.id !== player.id);
    const updatedBench = [...currentLineup.bench, newBenchPlayer];

    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
  };

  // Drop player on specific pitch coordinates
  const handlePlayerDropOnPitch = (player: Player, x: number, y: number) => {
    const existingPitchPlayer = currentLineup.players.find((p) => p.player.id === player.id);
    if (existingPitchPlayer) {
      handleUpdatePlayerPosition(existingPitchPlayer.instanceId, x, y);
      return;
    }

    const newPitchPlayer: PitchPlayer = {
      instanceId: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      playerId: player.id,
      player,
      x,
      y,
      shirtNumber: player.shirtNumber,
      isCaptain: false,
    };

    const updatedBench = currentLineup.bench.filter((p) => p.player.id !== player.id);
    const updatedPlayers = [...currentLineup.players, newPitchPlayer];

    onUpdateLineup({
      ...currentLineup,
      players: updatedPlayers,
      bench: updatedBench,
    });
    setSelectedPlayerId(newPitchPlayer.instanceId);
  };

  // --- FORMATION SELECTION ---
  const handleSelectFormation = (formation: Formation) => {
    const currentOnPitch = [...currentLineup.players];
    const newSlots = formation.slots;

    // Smoothly rearrange existing players into formation slots
    const updatedPlayers = currentOnPitch.map((p, idx) => {
      if (idx < newSlots.length) {
        const slot = newSlots[idx];
        return {
          ...p,
          x: slot.x,
          y: slot.y,
          player: {
            ...p.player,
            // Keep player's position or assign formation slot position if generic
            position: p.player.position || slot.position,
          },
        };
      }
      return p;
    });

    onUpdateLineup({
      ...currentLineup,
      formationId: formation.id,
      players: updatedPlayers,
    });
  };

  // Save Current Arrangement as Custom Formation
  const handleSaveAsCustomFormation = (name: string) => {
    const customSlots = currentLineup.players.map((p, i) => ({
      position: p.player.position,
      label: p.player.position,
      x: p.x,
      y: p.y,
    }));

    const customId = `custom-form-${Date.now()}`;
    const customFormation: Formation = {
      id: customId,
      name,
      category: 'Custom',
      description: `Custom ${currentLineup.players.length}-player tactical arrangement`,
      slots: customSlots,
    };

    PRESET_FORMATIONS.push(customFormation);
    onUpdateLineup({ ...currentLineup, formationId: customId });
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
  };

  // Reset current pitch to default formation coordinates
  const handleResetFormationPositions = () => {
    const formation = getFormationById(currentLineup.formationId);
    const updatedPlayers = currentLineup.players.map((p, idx) => {
      if (idx < formation.slots.length) {
        return {
          ...p,
          x: formation.slots[idx].x,
          y: formation.slots[idx].y,
          originX: formation.slots[idx].x,
          originY: formation.slots[idx].y,
        };
      }
      return p;
    });
    onUpdateLineup({ ...currentLineup, players: updatedPlayers });
  };

  // Apply real tactical preset
  const handleApplyTacticalPreset = (preset: TacticalPreset) => {
    const formation = getFormationById(preset.formationId);
    const updatedPlayers = currentLineup.players.map((p, idx) => {
      const customSlot = preset.slotAdjustments?.[idx];
      if (customSlot) {
        return {
          ...p,
          x: customSlot.x,
          y: customSlot.y,
          originX: customSlot.x,
          originY: customSlot.y,
          tacticalRole: customSlot.tacticalRole || p.tacticalRole,
        };
      }
      if (idx < formation.slots.length) {
        return {
          ...p,
          x: formation.slots[idx].x,
          y: formation.slots[idx].y,
          originX: formation.slots[idx].x,
          originY: formation.slots[idx].y,
        };
      }
      return p;
    });

    const tacticalNote = `[Tactical Preset: ${preset.name}]\n${preset.description}\nAttacking: ${preset.tacticalInstructions.attackingPhase}\nDefending: ${preset.tacticalInstructions.defensivePhase}\nTransition: ${preset.tacticalInstructions.transitionPhase}\nDefensive Line: ${preset.tacticalInstructions.defensiveLine} | Pressing: ${preset.tacticalInstructions.pressingIntensity}`;

    onUpdateLineup({
      ...currentLineup,
      formationId: preset.formationId,
      players: updatedPlayers,
      annotations: preset.annotations ? [...currentLineup.annotations, ...preset.annotations] : currentLineup.annotations,
      notes: tacticalNote,
    });
    setShowTacticalOptions(false);
    confetti({ particleCount: 35, spread: 60 });
  };

  // Clear all players from pitch
  const handleClearPitch = () => {
    if (confirm('Clear all players from the pitch? (They will be moved to the substitutes bench)')) {
      const movedToBench = currentLineup.players.map((p) => ({
        ...p,
        instanceId: `bench-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      }));
      onUpdateLineup({
        ...currentLineup,
        players: [],
        bench: [...currentLineup.bench, ...movedToBench],
      });
      setSelectedPlayerId(null);
    }
  };

  // --- ANNOTATIONS SYSTEM ---
  const handleAddAnnotation = (newAnn: Annotation) => {
    setAnnotationHistory((prev) => [...prev, currentLineup.annotations]);
    setRedoHistory([]);
    onUpdateLineup({
      ...currentLineup,
      annotations: [...currentLineup.annotations, newAnn],
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotationHistory((prev) => [...prev, currentLineup.annotations]);
    setRedoHistory([]);
    onUpdateLineup({
      ...currentLineup,
      annotations: currentLineup.annotations.filter((a) => a.id !== id),
    });
  };

  const handleUndoAnnotation = () => {
    if (annotationHistory.length === 0) return;
    const previous = annotationHistory[annotationHistory.length - 1];
    setRedoHistory((prev) => [...prev, currentLineup.annotations]);
    setAnnotationHistory((prev) => prev.slice(0, prev.length - 1));
    onUpdateLineup({
      ...currentLineup,
      annotations: previous,
    });
  };

  const handleRedoAnnotation = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setAnnotationHistory((prev) => [...prev, currentLineup.annotations]);
    setRedoHistory((prev) => prev.slice(0, prev.length - 1));
    onUpdateLineup({
      ...currentLineup,
      annotations: next,
    });
  };

  const handleClearAnnotations = () => {
    if (currentLineup.annotations.length === 0) return;
    setAnnotationHistory((prev) => [...prev, currentLineup.annotations]);
    setRedoHistory([]);
    onUpdateLineup({
      ...currentLineup,
      annotations: [],
    });
  };

  // Display settings update helper
  const updateDisplaySettings = (key: string, value: any) => {
    onUpdateLineup({
      ...currentLineup,
      displaySettings: {
        ...currentLineup.displaySettings,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#0f1115]">
      {/* ========================================================= */}
      {/* FULLSCREEN COACH PRESENTATION OVERLAY                      */}
      {/* ========================================================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#090b0e] text-slate-100 font-sans select-none animate-in fade-in duration-150">
          {/* Top Presentation Bar */}
          <header className="h-14 px-3 sm:px-6 bg-[#11141a]/95 border-b border-[#222834] flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0 backdrop-blur-md z-20">
            {/* Left: Formation & Lineup Details */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>{currentLineup.formationId.toUpperCase()}</span>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="font-extrabold text-xs text-slate-200 truncate max-w-[160px]">
                  {currentLineup.title || 'Starting XI'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentLineup.players.length} On Pitch • {currentLineup.bench.length} Subs
                </span>
              </div>
              {/* Quick Formation Switcher */}
              <select
                value={currentLineup.formationId}
                onChange={(e) => handleSelectFormation(e.target.value)}
                className="bg-[#181c24] border border-[#262c38] text-slate-200 rounded-lg text-xs py-1 px-2 focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {PRESET_FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#14171f]">
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Center: Tactical Annotation Tools & Color Palette */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mode toggle */}
              <div className="flex items-center bg-[#0e1015] p-0.5 rounded-xl border border-[#222834]">
                <button
                  type="button"
                  onClick={() => setIsDrawingMode(false)}
                  className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    !isDrawingMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Move Players (V)"
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Move</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawingMode(true)}
                  className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    isDrawingMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Draw Tactics (D)"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Draw</span>
                </button>
              </div>

              {/* Tool icons (when drawing mode is active) */}
              {isDrawingMode && (
                <div className="hidden lg:flex items-center gap-1 bg-[#0e1015] p-0.5 rounded-xl border border-[#222834]">
                  {[
                    { id: 'curved-arrow' as AnnotationTool, label: 'Curved Run', icon: Footprints },
                    { id: 'arrow' as AnnotationTool, label: 'Attack Arrow', icon: ArrowRight },
                    { id: 'dashed-arrow' as AnnotationTool, label: 'Pass Lane', icon: Split },
                    { id: 'pen' as AnnotationTool, label: 'Freehand', icon: Pencil },
                    { id: 'movement' as AnnotationTool, label: 'Movement', icon: Minus },
                    { id: 'circle' as AnnotationTool, label: 'Circle Zone', icon: CircleIcon },
                    { id: 'rect' as AnnotationTool, label: 'Zonal Box', icon: Square },
                    { id: 'highlight' as AnnotationTool, label: 'Highlight', icon: Sparkles },
                    { id: 'text' as AnnotationTool, label: 'Text Tag', icon: Type },
                    { id: 'eraser' as AnnotationTool, label: 'Eraser', icon: Eraser },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = annotationTool === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAnnotationTool(t.id)}
                        title={t.label}
                        className={`p-1.5 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c202a]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Color Swatches */}
              {isDrawingMode && (
                <div className="flex items-center gap-1 bg-[#0e1015] p-1 rounded-xl border border-[#222834]">
                  {[
                    { label: 'Tactical Yellow', value: '#facc15' },
                    { label: 'Electric Sky', value: '#38bdf8' },
                    { label: 'Vibrant Orange', value: '#fb923c' },
                    { label: 'Crimson Press', value: '#f43f5e' },
                    { label: 'Pitch White', value: '#ffffff' },
                    { label: 'Neon Emerald', value: '#34d399' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAnnotationColor(c.value)}
                      title={c.label}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        annotationColor === c.value ? 'scale-125 ring-2 ring-emerald-500 border border-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              )}

              {/* Undo / Redo / Clear */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndoAnnotation}
                  disabled={annotationHistory.length === 0}
                  className="p-1.5 rounded-lg bg-[#181c24] border border-[#262c38] text-slate-300 hover:text-white disabled:opacity-40"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedoAnnotation}
                  disabled={redoHistory.length === 0}
                  className="p-1.5 rounded-lg bg-[#181c24] border border-[#262c38] text-slate-300 hover:text-white disabled:opacity-40"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearAnnotations}
                  disabled={currentLineup.annotations.length === 0}
                  className="p-1.5 rounded-lg bg-[#181c24] border border-[#262c38] text-slate-300 hover:text-rose-400 disabled:opacity-40"
                  title="Clear All Annotations"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Reset, Bench, Themes, Exit Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleResetFormationPositions}
                title="Reset player markers to formation slots"
                className="hidden sm:flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-300 hover:text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Slots</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFullscreenBench(!showFullscreenBench)}
                title="Toggle Substitutes / Bench Panel"
                className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                  showFullscreenBench
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#181c24] text-slate-300 hover:text-white border-[#262c38]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bench</span>
                {currentLineup.bench.length > 0 && (
                  <span className="bg-[#0e1015] px-1.5 py-0.2 rounded text-[10px] text-amber-400">
                    {currentLineup.bench.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all"
                title="Exit Fullscreen Presentation (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">[Esc]</span>
              </button>
            </div>
          </header>

          {/* Fullscreen Pitch Centerpiece */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-2 overflow-hidden">
            <FootballPitch
              players={currentLineup.players}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              onUpdatePlayerPosition={handleUpdatePlayerPosition}
              onPlayerDrop={handlePlayerDropOnPitch}
              annotations={currentLineup.annotations}
              annotationTool={annotationTool}
              annotationColor={annotationColor}
              annotationStrokeWidth={annotationStrokeWidth}
              isDrawingMode={isDrawingMode}
              onAddAnnotation={handleAddAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              displaySettings={currentLineup.displaySettings}
            />

            {/* Contextual Player Editor Overlay */}
            {selectedPitchPlayer && (
              <div className="absolute top-4 right-4 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <PlayerEditor
                  selectedPitchPlayer={selectedPitchPlayer}
                  allLineupPlayers={currentLineup.players}
                  onClose={() => setSelectedPlayerId(null)}
                  onUpdatePlayer={handleUpdatePlayer}
                  onMoveToBench={handleMoveToBench}
                  onRemovePlayer={handleRemovePlayer}
                  onSetCaptain={handleSetCaptain}
                />
              </div>
            )}

            {/* Fullscreen Substitutes Panel Floating Drawer */}
            {showFullscreenBench && (
              <div className="absolute bottom-3 inset-x-0 mx-auto max-w-3xl z-40 px-3 pointer-events-none animate-in slide-in-from-bottom duration-150">
                <div className="pointer-events-auto shadow-2xl">
                  <Bench
                    benchPlayers={currentLineup.bench}
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={setSelectedPlayerId}
                    onRemoveFromBench={handleRemoveFromBench}
                    onMoveToPitch={handleMoveBenchToPitch}
                    displaySettings={currentLineup.displaySettings}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP TACTICAL CONTROL BAR */}
      <div className="bg-[#13161c] border-b border-[#222733] px-3 sm:px-5 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 flex-shrink-0">
        {/* Lineup Title & Match Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={currentLineup.title}
              onChange={(e) => onUpdateLineup({ ...currentLineup, title: e.target.value })}
              placeholder="Tactics Title..."
              className="bg-transparent font-extrabold text-sm sm:text-base text-slate-100 placeholder-slate-500 border-b border-transparent hover:border-[#2a3140] focus:border-emerald-500 focus:outline-none truncate"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="font-bold text-emerald-400">
                {currentLineup.formationId.toUpperCase()}
              </span>
              <span>•</span>
              <span>{currentLineup.players.length} On Pitch</span>
              {currentLineup.bench.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-400">{currentLineup.bench.length} Subs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Left Sidebar */}
          <button
            type="button"
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            title={showLeftSidebar ? 'Collapse Tactics Panel (Enlarge Pitch)' : 'Show Tactics Panel'}
            className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold hidden lg:flex items-center gap-1.5 transition-all ${
              showLeftSidebar
                ? 'bg-[#181c24] hover:bg-[#202530] border-[#262c38] text-slate-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {showLeftSidebar ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{showLeftSidebar ? 'Tactics' : 'Show Tactics'}</span>
          </button>

          {/* Toggle Right Sidebar */}
          <button
            type="button"
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            title={showRightSidebar ? 'Collapse Player Panel (Enlarge Pitch)' : 'Show Player Panel'}
            className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold hidden lg:flex items-center gap-1.5 transition-all ${
              showRightSidebar
                ? 'bg-[#181c24] hover:bg-[#202530] border-[#262c38] text-slate-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {showRightSidebar ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{showRightSidebar ? 'Players' : 'Show Players'}</span>
          </button>

          {/* Quick Reset Formation Positions */}
          <button
            type="button"
            onClick={handleResetFormationPositions}
            title="Snap players back to default formation slots"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Slots</span>
          </button>

          {/* Clear Pitch */}
          <button
            type="button"
            onClick={handleClearPitch}
            title="Move all pitch players to bench"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#181c24] hover:bg-rose-600/80 border border-[#262c38] text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Pitch</span>
          </button>

          {/* Tactical Options & Real Concepts Panel */}
          <button
            type="button"
            onClick={() => setShowTacticalOptions(true)}
            title="Real Tactical Philosophies & Concepts (Gegenpressing, Tiki-Taka, Low Block...)"
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showTacticalOptions
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#181c24] hover:bg-[#202530] border-[#262c38] text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tactics</span>
          </button>

          {/* AI Tactical Assistant */}
          <button
            type="button"
            onClick={() => setShowAiAssistant(true)}
            title="AI Tactical Assistant & Lineup Analysis"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Tactical AI</span>
          </button>

          {/* Fullscreen Board Presentation */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen Presentation (Esc)' : 'Enter Fullscreen Presentation'}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#181c24] hover:bg-[#202530] border border-[#262c38] text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>

          {/* Board Display Settings Trigger */}
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Pitch & Kit Display Settings"
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showSettingsDrawer
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#181c24] hover:bg-[#202530] border-[#262c38] text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* THREE-COLUMN EDITOR WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Formations, Annotation Tools & Pitch Style   */}
        {/* ========================================================= */}
        {showLeftSidebar && (
          <aside className="hidden lg:flex w-64 xl:w-70 flex-col gap-2 p-2 border-r border-[#222733] bg-[#11141a]/95 overflow-y-auto min-h-0 flex-shrink-0 animate-in slide-in-from-left duration-150">
            {/* Tactical Formations */}
            <FormationSelector
              currentFormationId={currentLineup.formationId}
              onSelectFormation={handleSelectFormation}
              onSaveAsCustomFormation={handleSaveAsCustomFormation}
            />

            {/* Tactical Annotation Tools */}
            <AnnotationToolbar
              currentTool={annotationTool}
              onSelectTool={setAnnotationTool}
              currentColor={annotationColor}
              onChangeColor={setAnnotationColor}
              currentStrokeWidth={annotationStrokeWidth}
              onChangeStrokeWidth={setAnnotationStrokeWidth}
              isDrawingMode={isDrawingMode}
              onToggleDrawingMode={setIsDrawingMode}
              canUndo={annotationHistory.length > 0}
              canRedo={redoHistory.length > 0}
              onUndo={handleUndoAnnotation}
              onRedo={handleRedoAnnotation}
              onClear={handleClearAnnotations}
              annotationCount={currentLineup.annotations.length}
            />

            {/* Quick Tactics Notes Box */}
            <div className="bg-[#161922] border border-[#222834] rounded-xl p-2 shadow-xl backdrop-blur-md flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tactical Instructions & Notes</span>
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Build up through #6 pivot, press high in 4-4-2 block, overlap wingbacks on transitions..."
                value={currentLineup.notes || ''}
                onChange={(e) => onUpdateLineup({ ...currentLineup, notes: e.target.value })}
                className="bg-[#0e1015] border border-[#222834] rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </aside>
        )}

        {/* ========================================================= */}
        {/* CENTER COLUMN: Football Pitch (Centerpiece) & Bench Dock  */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-3 overflow-y-auto relative min-h-0 bg-[#0f1115] gap-3">
          {/* Pitch Canvas Area - Enlarged with comfortable vertical breathing room */}
          <div className="w-full flex-1 flex items-center justify-center relative min-h-[580px] sm:min-h-[680px] lg:min-h-[750px] flex-shrink-0">
            <FootballPitch
              players={currentLineup.players}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              onUpdatePlayerPosition={handleUpdatePlayerPosition}
              onPlayerDrop={handlePlayerDropOnPitch}
              annotations={currentLineup.annotations}
              annotationTool={annotationTool}
              annotationColor={annotationColor}
              annotationStrokeWidth={annotationStrokeWidth}
              isDrawingMode={isDrawingMode}
              onAddAnnotation={handleAddAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              displaySettings={currentLineup.displaySettings}
            />
          </div>

          {/* Substitutes / Bench Dock Underneath Pitch with Bottom Scroll Margin */}
          <div className="w-full max-w-4xl flex-shrink-0 z-10 px-2 pb-8">
            <Bench
              benchPlayers={currentLineup.bench}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              onRemoveFromBench={handleRemoveFromBench}
              onMoveToPitch={handleMoveBenchToPitch}
              displaySettings={currentLineup.displaySettings}
            />
          </div>

          {/* Floating Selected Player Contextual Editor (Overlay on Pitch) */}
          {selectedPitchPlayer && (
            <div className="absolute top-3 right-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <PlayerEditor
                selectedPitchPlayer={selectedPitchPlayer}
                allLineupPlayers={currentLineup.players}
                onClose={() => setSelectedPlayerId(null)}
                onUpdatePlayer={handleUpdatePlayer}
                onMoveToBench={handleMoveToBench}
                onRemovePlayer={handleRemovePlayer}
                onSetCaptain={handleSetCaptain}
              />
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Player Database Search & Selected Player    */}
        {/* ========================================================= */}
        {showRightSidebar && (
          <aside className="hidden lg:flex w-80 xl:w-96 flex-col p-2 border-l border-[#222733] bg-[#11141a]/95 overflow-hidden min-h-0 flex-shrink-0 animate-in slide-in-from-right duration-150">
            <PlayerSearch
              allPlayers={allPlayers}
              pitchPlayerIds={pitchPlayerIds}
              benchPlayerIds={benchPlayerIds}
              onAddToPitch={handleAddPlayerToPitch}
              onAddToBench={handleAddPlayerToBench}
              onOpenCreateCustomPlayer={onOpenCreateCustomPlayer}
              onEditCustomPlayer={onEditCustomPlayer}
              onDeleteCustomPlayer={onDeleteCustomPlayer}
            />
          </aside>
        )}
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION & MODAL DRAWERS                  */}
      {/* ========================================================= */}
      <div className="lg:hidden bg-[#13161c] border-t border-[#222733] p-2 flex items-center justify-around z-30">
        <button
          type="button"
          onClick={() =>
            setMobileActiveDrawer(mobileActiveDrawer === 'formations' ? 'none' : 'formations')
          }
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-bold ${
            mobileActiveDrawer === 'formations' ? 'text-emerald-400 bg-[#1e232d]' : 'text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Formations</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsDrawingMode(!isDrawingMode);
            setMobileActiveDrawer(mobileActiveDrawer === 'annotations' ? 'none' : 'annotations');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-bold ${
            isDrawingMode ? 'text-emerald-400 bg-[#1e232d]' : 'text-slate-400'
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span>{isDrawingMode ? 'Drawing' : 'Draw'}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setMobileActiveDrawer(mobileActiveDrawer === 'search' ? 'none' : 'search')
          }
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-bold ${
            mobileActiveDrawer === 'search' ? 'text-emerald-400 bg-[#1e232d]' : 'text-slate-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Players</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setMobileActiveDrawer(mobileActiveDrawer === 'bench' ? 'none' : 'bench')
          }
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-bold ${
            mobileActiveDrawer === 'bench' ? 'text-emerald-400 bg-[#1e232d]' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Bench ({currentLineup.bench.length})</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setMobileActiveDrawer(mobileActiveDrawer === 'settings' ? 'none' : 'settings')
          }
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-bold ${
            mobileActiveDrawer === 'settings' ? 'text-emerald-400 bg-[#1e232d]' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileActiveDrawer !== 'none' && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#14171d] border-t border-[#262c38] rounded-t-3xl p-4 max-h-[80vh] flex flex-col gap-3 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222733] pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {mobileActiveDrawer}
              </span>
              <button
                type="button"
                onClick={() => setMobileActiveDrawer('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {mobileActiveDrawer === 'formations' && (
                <FormationSelector
                  currentFormationId={currentLineup.formationId}
                  onSelectFormation={(f) => {
                    handleSelectFormation(f);
                    setMobileActiveDrawer('none');
                  }}
                  onSaveAsCustomFormation={handleSaveAsCustomFormation}
                />
              )}

              {mobileActiveDrawer === 'annotations' && (
                <AnnotationToolbar
                  currentTool={annotationTool}
                  onSelectTool={setAnnotationTool}
                  currentColor={annotationColor}
                  onChangeColor={setAnnotationColor}
                  currentStrokeWidth={annotationStrokeWidth}
                  onChangeStrokeWidth={setAnnotationStrokeWidth}
                  isDrawingMode={isDrawingMode}
                  onToggleDrawingMode={setIsDrawingMode}
                  canUndo={annotationHistory.length > 0}
                  canRedo={redoHistory.length > 0}
                  onUndo={handleUndoAnnotation}
                  onRedo={handleRedoAnnotation}
                  onClear={handleClearAnnotations}
                  annotationCount={currentLineup.annotations.length}
                />
              )}

              {mobileActiveDrawer === 'search' && (
                <div className="h-[60vh]">
                  <PlayerSearch
                    allPlayers={allPlayers}
                    pitchPlayerIds={pitchPlayerIds}
                    benchPlayerIds={benchPlayerIds}
                    onAddToPitch={(p) => {
                      handleAddPlayerToPitch(p);
                      setMobileActiveDrawer('none');
                    }}
                    onAddToBench={handleAddPlayerToBench}
                    onOpenCreateCustomPlayer={onOpenCreateCustomPlayer}
                    onEditCustomPlayer={onEditCustomPlayer}
                    onDeleteCustomPlayer={onDeleteCustomPlayer}
                  />
                </div>
              )}

              {mobileActiveDrawer === 'bench' && (
                <Bench
                  benchPlayers={currentLineup.bench}
                  selectedPlayerId={selectedPlayerId}
                  onSelectPlayer={setSelectedPlayerId}
                  onRemoveFromBench={handleRemoveFromBench}
                  onMoveToPitch={(id) => {
                    handleMoveBenchToPitch(id);
                    setMobileActiveDrawer('none');
                  }}
                  displaySettings={currentLineup.displaySettings}
                />
              )}

              {mobileActiveDrawer === 'settings' && (
                <div className="flex flex-col gap-4">
                  {/* Pitch Theme */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Pitch Grass Surface</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['emerald', 'classic', 'night', 'tactical-board', 'slate'] as PitchTheme[]).map(
                        (theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => updateDisplaySettings('pitchTheme', theme)}
                            className={`p-2 rounded-xl border text-xs font-bold capitalize ${
                              currentLineup.displaySettings.pitchTheme === theme
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-[#0f1115] text-slate-300 border-[#222834]'
                            }`}
                          >
                            {theme.replace('-', ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SETTINGS MODAL */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#14171d] border border-[#262c38] rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#222733] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Tactics Board Display Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pitch Theme */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300">Pitch Turf Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['emerald', 'classic', 'night', 'tactical-board', 'slate'] as PitchTheme[]).map(
                  (theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => updateDisplaySettings('pitchTheme', theme)}
                      className={`p-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        currentLineup.displaySettings.pitchTheme === theme
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                          : 'bg-[#0f1115] text-slate-300 border-[#222834] hover:border-[#333b4d]'
                      }`}
                    >
                      {theme.replace('-', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Global Marker Style */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300">Player Token Style</label>
              <div className="grid grid-cols-4 gap-2">
                {(['avatar', 'jersey', 'badge', 'minimal'] as MarkerStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateDisplaySettings('markerStyle', style)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                      currentLineup.displaySettings.markerStyle === style
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-[#0f1115] text-slate-300 border-[#222834]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Toggles */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#222733]">
              <label className="text-xs font-bold text-slate-300">Overlays & Markings</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.showNames}
                    onChange={(e) => updateDisplaySettings('showNames', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Player Names</span>
                </label>

                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.showNumbers}
                    onChange={(e) => updateDisplaySettings('showNumbers', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Shirt Numbers</span>
                </label>

                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.showRatings}
                    onChange={(e) => updateDisplaySettings('showRatings', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Star Ratings</span>
                </label>

                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.showPositions}
                    onChange={(e) => updateDisplaySettings('showPositions', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Position Tags</span>
                </label>

                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.showPlayerTrails ?? true}
                    onChange={(e) => updateDisplaySettings('showPlayerTrails', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Movement Run Trails</span>
                </label>

                <label className="flex items-center gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#222834] text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLineup.displaySettings.snapToFormation ?? false}
                    onChange={(e) => updateDisplaySettings('snapToFormation', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Snap to Formation Slots</span>
                </label>
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2 border-t border-[#222733]">
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TACTICAL OPTIONS & CONCEPTS MODAL */}
      {showTacticalOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#222834] bg-[#11141a]">
            <TacticalOptionsPanel
              currentLineup={currentLineup}
              onApplyTacticalStyle={handleApplyTacticalPreset}
              onUpdateNotes={(notes) => onUpdateLineup({ ...currentLineup, notes })}
              onClose={() => setShowTacticalOptions(false)}
            />
          </div>
        </div>
      )}

      {/* AI TACTICAL ASSISTANT MODAL */}
      {showAiAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-3xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#222834] bg-[#11141a]">
            <AiTacticalAssistant
              currentLineup={currentLineup}
              onClose={() => setShowAiAssistant(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
