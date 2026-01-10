import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Player, PlayerClass, Team } from '../types';
import { Users, Plus, Search, X, Crown, Trash2 } from 'lucide-react';

const PLAYER_CLASSES: PlayerClass[] = [
  'Healer',
  'Tank',
  'DPS Strategic',
  'DPS Silkbind',
  'DPS Bamboo',
  'DPS Nameless',
  'DPS Misto',
];

const CLASS_COLORS: Record<PlayerClass, string> = {
  'Healer': '#10b981',
  'Tank': '#3b82f6',
  'DPS Strategic': '#f59e0b',
  'DPS Silkbind': '#8b5cf6',
  'DPS Bamboo': '#14b8a6',
  'DPS Nameless': '#ef4444',
  'DPS Misto': '#6366f1',
};

export function RosterPanel() {
  const { state, addPlayer, updatePlayer, removePlayer, updateTeam } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);

  const unassignedPlayers = useMemo(
    () => state.players.filter((p) => p.teamId === null),
    [state.players]
  );

  const filteredPlayers = useMemo(() => {
    return unassignedPlayers.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [unassignedPlayers, search]);

  const getTeamPlayers = (teamId: number) => {
    return state.players.filter((p) => p.teamId === teamId);
  };

  const getClassCount = (players: Player[]) => {
    const counts: Partial<Record<PlayerClass, number>> = {};
    players.forEach((p) => {
      counts[p.class] = (counts[p.class] || 0) + 1;
    });
    return counts;
  };

  const handleDragStart = (player: Player) => {
    setDraggedPlayer(player);
  };

  const handleDrop = (teamId: number | null) => {
    if (draggedPlayer) {
      updatePlayer(draggedPlayer.id, { teamId });
      setDraggedPlayer(null);
    }
  };

  return (
    <div className="w-80 bg-white border-r-2 border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Users className="w-6 h-6" />
          Roster
        </h2>
        <div className="text-sm text-gray-700 mb-3 font-medium">
          Players: {state.players.length}/30
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={state.players.length >= 30}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search unassigned..."
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div
            className="min-h-24 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(null)}
          >
            <div className="text-xs text-gray-600 mb-2 font-semibold">
              UNASSIGNED ({filteredPlayers.length})
            </div>
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onDragStart={handleDragStart}
                onRemove={() => removePlayer(player.id)}
                onUpdate={(updates) => updatePlayer(player.id, updates)}
              />
            ))}
          </div>

          <div className="space-y-3">
            {state.teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                players={getTeamPlayers(team.id)}
                classCounts={getClassCount(getTeamPlayers(team.id))}
                onDrop={() => handleDrop(team.id)}
                onDragStart={handleDragStart}
                onRemovePlayer={removePlayer}
                onUpdatePlayer={updatePlayer}
                onUpdateTeam={(updates) => updateTeam(team.id, updates)}
                isEditing={editingTeam === team.id}
                onEdit={() => setEditingTeam(team.id)}
                onStopEdit={() => setEditingTeam(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onAdd={(player) => {
            addPlayer(player);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function PlayerCard({
  player,
  onDragStart,
  onRemove,
  onUpdate,
}: {
  player: Player;
  onDragStart: (p: Player) => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<Player>) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(player)}
      className="bg-white border border-gray-300 rounded p-2 mb-2 cursor-move hover:border-green-500 hover:shadow-md transition-all group active:scale-95"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {player.isLeader && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
          <span className="text-gray-900 text-sm font-medium truncate">{player.name}</span>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div
        className="text-xs px-2 py-0.5 rounded inline-block mt-1 font-medium"
        style={{ backgroundColor: CLASS_COLORS[player.class] + '20', color: CLASS_COLORS[player.class] }}
      >
        {player.class}
      </div>
    </div>
  );
}

function TeamCard({
  team,
  players,
  classCounts,
  onDrop,
  onDragStart,
  onRemovePlayer,
  onUpdatePlayer,
  onUpdateTeam,
  isEditing,
  onEdit,
  onStopEdit,
}: {
  team: Team;
  players: Player[];
  classCounts: Partial<Record<PlayerClass, number>>;
  onDrop: () => void;
  onDragStart: (p: Player) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onUpdateTeam: (updates: Partial<Team>) => void;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
}) {
  const [editName, setEditName] = useState(team.name);

  return (
    <div
      className="border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ borderColor: team.color }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div
        className="p-2 text-white font-semibold text-sm flex items-center justify-between"
        style={{ backgroundColor: team.color }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => {
              onUpdateTeam({ name: editName });
              onStopEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdateTeam({ name: editName });
                onStopEdit();
              }
            }}
            className="flex-1 bg-white/20 px-2 py-1 rounded text-sm focus:outline-none"
            autoFocus
          />
        ) : (
          <span onClick={onEdit} className="cursor-pointer flex-1">
            {team.name}
          </span>
        )}
        <input
          type="color"
          value={team.color}
          onChange={(e) => onUpdateTeam({ color: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer ml-2"
        />
      </div>
      <div className="bg-gray-50 p-2">
        <div className="text-xs text-gray-700 mb-1 font-medium">
          Members: {players.length}
          {Object.keys(classCounts).length > 0 && (
            <span className="ml-2 text-gray-600">
              {Object.entries(classCounts).map(([cls, count]) => (
                <span key={cls} className="ml-1">
                  {cls.split(' ')[0]}: {count}
                </span>
              ))}
            </span>
          )}
        </div>
        <div className="space-y-1">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onDragStart={onDragStart}
              onRemove={() => onRemovePlayer(player.id)}
              onUpdate={(updates) => onUpdatePlayer(player.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AddPlayerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (player: Omit<Player, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [playerClass, setPlayerClass] = useState<PlayerClass>('DPS Misto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        class: playerClass,
        teamId: null,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Add New Player</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Player name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={playerClass}
              onChange={(e) => setPlayerClass(e.target.value as PlayerClass)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            >
              {PLAYER_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
