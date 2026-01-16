import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AppState, Player, Team, MapElement, MapViewport, MapBackground, ToolMode } from '../types';

const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: 'Team 1 — Vanguard', color: '#ef4444' },
  { id: 2, name: 'Team 2 — Phoenix', color: '#f59e0b' },
  { id: 3, name: 'Team 3 — Dragon', color: '#10b981' },
  { id: 4, name: 'Team 4 — Tiger', color: '#3b82f6' },
  { id: 5, name: 'Team 5 — Crane', color: '#8b5cf6' },
  { id: 6, name: 'Team 6 — Serpent', color: '#ec4899' },
  { id: 7, name: 'Team 7 — Reserva', color: '#64748b' },
];

const INITIAL_STATE: AppState = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  teams: DEFAULT_TEAMS,
  players: [],
  strategyNotes: '',
  map: {
    backgroundImage: null,
    viewport: { zoom: 1, panX: 0, panY: 0 },
    elements: [],
  },
};

interface AppContextType {
  state: AppState;
  toolMode: ToolMode;
  selectedElement: MapElement | null;
  setToolMode: (mode: ToolMode) => void;
  setSelectedElement: (element: MapElement | null) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  updateTeam: (id: number, updates: Partial<Team>) => void;
  addMapElement: (element: Omit<MapElement, 'id'>) => void;
  updateMapElement: (id: string, updates: Partial<MapElement>) => void;
  removeMapElement: (id: string) => void;
  clearMapElements: () => void;
  updateViewport: (viewport: Partial<MapViewport>) => void;
  setBackgroundImage: (bg: MapBackground | null) => void;
  setStrategyNotes: (notes: string) => void;
  exportState: () => string;
  importState: (json: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gvg-planner-state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return INITIAL_STATE;
  });

  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const saveTimeoutRef = useRef<number>();

  const saveToLocalStorage = useCallback((newState: AppState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        const stateToSave = {
          ...newState,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    }, 500);
  }, []);

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state, saveToLocalStorage]);

  const addPlayer = useCallback((player: Omit<Player, 'id'>) => {
    setState((prev) => {
      const newPlayer: Player = {
        ...player,
        id: crypto.randomUUID(),
      };
      return {
        ...prev,
        players: [...prev.players, newPlayer],
      };
    });
  }, []);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
      map: {
        ...prev.map,
        elements: prev.map.elements.filter(
          (e) => e.type !== 'playerToken' || e.linkedPlayerId !== id
        ),
      },
    }));
  }, []);

  const updateTeam = useCallback((id: number, updates: Partial<Team>) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const addMapElement = useCallback((element: Omit<MapElement, 'id'>) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: [
          ...prev.map.elements,
          { ...element, id: crypto.randomUUID() } as MapElement,
        ],
      },
    }));
  }, []);

  const updateMapElement = useCallback((id: string, updates: Partial<MapElement>) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: prev.map.elements.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      },
    }));
  }, []);

  const removeMapElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: prev.map.elements.filter((e) => e.id !== id),
      },
    }));
    setSelectedElement(null);
  }, []);

  const clearMapElements = useCallback(() => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: [],
      },
    }));
    setSelectedElement(null);
  }, []);

  const updateViewport = useCallback((viewport: Partial<MapViewport>) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        viewport: { ...prev.map.viewport, ...viewport },
      },
    }));
  }, []);

  const setBackgroundImage = useCallback((bg: MapBackground | null) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        backgroundImage: bg,
      },
    }));
  }, []);

  const setStrategyNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      strategyNotes: notes,
    }));
  }, []);

  const exportState = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importState = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setState(imported);
      setSelectedElement(null);
      alert('State imported successfully');
    } catch (error) {
      alert('Failed to import state: Invalid JSON');
      console.error(error);
    }
  }, []);

  const resetAll = useCallback(() => {
    if (confirm('Are you sure you want to reset everything? This cannot be undone.')) {
      setState(INITIAL_STATE);
      setSelectedElement(null);
      setToolMode('select');
    }
  }, []);

  const value: AppContextType = {
    state,
    toolMode,
    selectedElement,
    setToolMode,
    setSelectedElement,
    addPlayer,
    updatePlayer,
    removePlayer,
    updateTeam,
    addMapElement,
    updateMapElement,
    removeMapElement,
    clearMapElements,
    updateViewport,
    setBackgroundImage,
    setStrategyNotes,
    exportState,
    importState,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
