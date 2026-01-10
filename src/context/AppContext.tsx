import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type { AppState, Player, Team, MapElement, MapViewport, MapBackground, ToolMode } from '../types';

const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: 'Team 1 — Vanguard', color: '#ef4444' },
  { id: 2, name: 'Team 2 — Phoenix', color: '#f59e0b' },
  { id: 3, name: 'Team 3 — Dragon', color: '#10b981' },
  { id: 4, name: 'Team 4 — Tiger', color: '#3b82f6' },
  { id: 5, name: 'Team 5 — Crane', color: '#8b5cf6' },
  { id: 6, name: 'Team 6 — Serpent', color: '#ec4899' },
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

  // ✅ undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gvg-planner-state';
const HISTORY_LIMIT = 200;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return INITIAL_STATE;
  });

  const [toolMode, setToolMode] = useState<ToolMode>('select');

  // ✅ seleção por ID (evita “snapshot” desatualizado)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return state.map.elements.find((e) => e.id === selectedElementId) ?? null;
  }, [state.map.elements, selectedElementId]);

  const setSelectedElement = useCallback((element: MapElement | null) => {
    setSelectedElementId(element?.id ?? null);
  }, []);

  // ✅ garante que seleção não aponte pra algo que não existe mais
  useEffect(() => {
    if (!selectedElementId) return;
    const exists = state.map.elements.some((e) => e.id === selectedElementId);
    if (!exists) setSelectedElementId(null);
  }, [state.map.elements, selectedElementId]);

  // ============================
  // ✅ Undo / Redo (histórico)
  // ============================
  const [past, setPast] = useState<AppState[]>([]);
  const [future, setFuture] = useState<AppState[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // helper que grava histórico e limpa future
  const commit = useCallback((updater: (prev: AppState) => AppState, recordHistory = true) => {
    setState((prev) => {
      const next = updater(prev);

      if (!recordHistory) return next;

      setPast((p) => {
        const np = [...p, prev];
        if (np.length > HISTORY_LIMIT) np.shift();
        return np;
      });

      setFuture([]); // qualquer ação nova invalida o redo
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];

      setFuture((f) => [state, ...f]);
      setState(previous);

      return p.slice(0, -1);
    });
  }, [state]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];

      setPast((p) => [...p, state]);
      setState(next);

      return f.slice(1);
    });
  }, [state]);

  // ============================
  // Persistência
  // ============================
  const saveTimeoutRef = useRef<number>();

  const saveToLocalStorage = useCallback((newState: AppState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        const stateToSave = { ...newState, lastUpdated: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    }, 500);
  }, []);

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state, saveToLocalStorage]);

  // ============================
  // Actions (agora usando commit)
  // ============================
  const addPlayer = useCallback((player: Omit<Player, 'id'>) => {
    commit((prev) => {
      if (prev.players.length >= 30) {
        alert('Maximum 30 players allowed');
        return prev;
      }
      const newPlayer: Player = { ...player, id: crypto.randomUUID() };
      return { ...prev, players: [...prev.players, newPlayer] };
    });
  }, [commit]);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    commit((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, [commit]);

  const removePlayer = useCallback((id: string) => {
    commit((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
      map: {
        ...prev.map,
        elements: prev.map.elements.filter((e) => e.type !== 'playerToken' || e.linkedPlayerId !== id),
      },
    }));
  }, [commit]);

  const updateTeam = useCallback((id: number, updates: Partial<Team>) => {
    commit((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, [commit]);

  const addMapElement = useCallback((element: Omit<MapElement, 'id'>) => {
    const id = crypto.randomUUID();
    commit((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: [...prev.map.elements, { ...element, id } as MapElement],
      },
    }));
    setSelectedElementId(id);
  }, [commit]);

  const updateMapElement = useCallback((id: string, updates: Partial<MapElement>) => {
    commit((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        elements: prev.map.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      },
    }));
  }, [commit]);

  const removeMapElement = useCallback((id: string) => {
    commit((prev) => ({
      ...prev,
      map: { ...prev.map, elements: prev.map.elements.filter((e) => e.id !== id) },
    }));
    setSelectedElementId((curr) => (curr === id ? null : curr));
  }, [commit]);

  const clearMapElements = useCallback(() => {
    commit((prev) => ({
      ...prev,
      map: { ...prev.map, elements: [] },
    }));
    setSelectedElementId(null);
  }, [commit]);

  // ⚠️ NÃO grava no histórico por padrão (pan/zoom explode a pilha)
  const updateViewport = useCallback((viewport: Partial<MapViewport>) => {
    commit(
      (prev) => ({
        ...prev,
        map: { ...prev.map, viewport: { ...prev.map.viewport, ...viewport } },
      }),
      false
    );
  }, [commit]);

  const setBackgroundImage = useCallback((bg: MapBackground | null) => {
    commit((prev) => ({
      ...prev,
      map: { ...prev.map, backgroundImage: bg },
    }));
  }, [commit]);

  const setStrategyNotes = useCallback((notes: string) => {
    commit((prev) => ({ ...prev, strategyNotes: notes }));
  }, [commit]);

  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importState = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setState(imported);
      setSelectedElementId(null);
      setPast([]);
      setFuture([]);
      alert('State imported successfully');
    } catch (error) {
      alert('Failed to import state: Invalid JSON');
      console.error(error);
    }
  }, []);

  const resetAll = useCallback(() => {
    if (confirm('Are you sure you want to reset everything? This cannot be undone.')) {
      setState(INITIAL_STATE);
      setSelectedElementId(null);
      setToolMode('select');
      setPast([]);
      setFuture([]);
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

    undo,
    redo,
    canUndo,
    canRedo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
