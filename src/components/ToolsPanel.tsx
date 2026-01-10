import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MousePointer2,
  MapPin,
  Type,
  ArrowRight,
  Square,
  Users,
  User,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Undo2,
  Redo2,
  Image as ImageIcon,
} from 'lucide-react';
import type { ToolMode, MarkerElement, TextElement, ArrowElement, AreaElement, TeamTokenElement, PlayerTokenElement } from '../types';

const TOOLS: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'select', icon: <MousePointer2 className="w-5 h-5" />, label: 'Select' },
  { mode: 'marker', icon: <MapPin className="w-5 h-5" />, label: 'Marker' },
  { mode: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { mode: 'arrow', icon: <ArrowRight className="w-5 h-5" />, label: 'Arrow' },
  { mode: 'area', icon: <Square className="w-5 h-5" />, label: 'Area' },
  { mode: 'teamToken', icon: <Users className="w-5 h-5" />, label: 'Team' },
  { mode: 'playerToken', icon: <User className="w-5 h-5" />, label: 'Player' },
];

export function ToolsPanel() {
  const {
    state,
    toolMode,
    setToolMode,
    selectedElement,
    updateMapElement,
    removeMapElement,
    clearMapElements,
    setStrategyNotes,
    setBackgroundImage,
    exportState,
    importState,
    resetAll,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gvg-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        importState(json);
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBackgroundImage({
            name: file.name,
            url: event.target?.result as string,
            width: img.width,
            height: img.height,
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 bg-white border-l-2 border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tools</h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex-1 bg-white border-2 border-gray-300 hover:border-green-600 disabled:border-gray-200 disabled:opacity-50 text-gray-700 disabled:text-gray-400 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex-1 bg-white border-2 border-gray-300 hover:border-green-600 disabled:border-gray-200 disabled:opacity-50 text-gray-700 disabled:text-gray-400 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool) => (
              <button
                key={tool.mode}
                onClick={() => setToolMode(tool.mode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                  toolMode === tool.mode
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                }`}
              >
                {tool.icon}
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Map Background</h3>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full bg-white border-2 border-gray-300 hover:border-green-600 text-gray-700 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Upload Background
          </button>
          {state.map.backgroundImage && (
            <div className="mt-2 text-xs text-gray-600 truncate">
              {state.map.backgroundImage.name}
            </div>
          )}
        </div>

        {selectedElement && (
          <ElementProperties
            element={selectedElement}
            onUpdate={(updates) => updateMapElement(selectedElement.id, updates)}
            onRemove={() => removeMapElement(selectedElement.id)}
            teams={state.teams}
            players={state.players}
          />
        )}

        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Strategy Notes</h3>
          <textarea
            value={state.strategyNotes}
            onChange={(e) => setStrategyNotes(e.target.value)}
            placeholder="Write your strategy briefing here..."
            className="w-full h-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none text-sm"
          />
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>

          <button
            onClick={handleExport}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </button>

          <button
            onClick={clearMapElements}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Markings
          </button>
        </div>
      </div>
    </div>
  );
}

function ElementProperties({
  element,
  onUpdate,
  onRemove,
  teams,
  players,
}: {
  element: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  teams: any[];
  players: any[];
}) {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {element.type === 'marker' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Label</label>
              <input
                type="text"
                value={(element as MarkerElement).label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Color</label>
              <input
                type="color"
                value={(element as MarkerElement).color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Size</label>
              <input
                type="range"
                min="20"
                max="80"
                value={(element as MarkerElement).size}
                onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}

        {element.type === 'text' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Content</label>
              <input
                type="text"
                value={(element as TextElement).content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Color</label>
              <input
                type="color"
                value={(element as TextElement).color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Font Size</label>
              <input
                type="range"
                min="12"
                max="48"
                value={(element as TextElement).fontSize}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}

        {element.type === 'arrow' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Color</label>
              <input
                type="color"
                value={(element as ArrowElement).color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Width</label>
              <input
                type="range"
                min="1"
                max="10"
                value={(element as ArrowElement).width}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}

        {element.type === 'area' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Color</label>
              <input
                type="color"
                value={(element as AreaElement).color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={(element as AreaElement).opacity}
                onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Shape</label>
              <select
                value={(element as AreaElement).shape}
                onChange={(e) => onUpdate({ shape: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
              </select>
            </div>
          </>
        )}

        {element.type === 'teamToken' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Team</label>
              <select
                value={(element as TeamTokenElement).teamId}
                onChange={(e) => onUpdate({ teamId: parseInt(e.target.value) })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Size</label>
              <input
                type="range"
                min="40"
                max="120"
                value={(element as TeamTokenElement).size}
                onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}

        {element.type === 'playerToken' && (
          <>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Player</label>
              <select
                value={(element as PlayerTokenElement).playerId}
                onChange={(e) => onUpdate({ playerId: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-medium">Size</label>
              <input
                type="range"
                min="30"
                max="80"
                value={(element as PlayerTokenElement).size}
                onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
