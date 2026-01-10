import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { MapElement, MarkerElement, TextElement, ArrowElement, AreaElement, TeamTokenElement, PlayerTokenElement } from '../types';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function MapCanvas() {
  const {
    state,
    toolMode,
    selectedElement,
    setSelectedElement,
    addMapElement,
    updateMapElement,
    updateViewport,
  } = useApp();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const { viewport } = state.map;

  useEffect(() => {
    if (state.map.backgroundImage?.url) {
      const img = new Image();
      img.src = state.map.backgroundImage.url;
      img.onload = () => setBackgroundImage(img);
    } else {
      setBackgroundImage(null);
    }
  }, [state.map.backgroundImage]);

  const getMousePos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - viewport.panX) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.panY) / viewport.zoom,
    };
  }, [viewport]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * delta));
    updateViewport({ zoom: newZoom });
  }, [viewport.zoom, updateViewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
      return;
    }

    const pos = getMousePos(e);

    if (toolMode === 'select') {
      const clickedElement = findElementAtPosition(pos.x, pos.y);
      if (clickedElement) {
        setSelectedElement(clickedElement);
        setIsDraggingElement(true);
        setDragOffset({ x: pos.x - clickedElement.x, y: pos.y - clickedElement.y });
      } else {
        setSelectedElement(null);
      }
    } else if (toolMode === 'arrow') {
      setArrowStart(pos);
    } else if (toolMode === 'marker') {
      addMapElement({
        type: 'marker',
        x: pos.x,
        y: pos.y,
        icon: 'flag',
        label: 'Marker',
        color: '#ef4444',
        size: 30,
      } as Omit<MarkerElement, 'id'>);
    } else if (toolMode === 'text') {
      addMapElement({
        type: 'text',
        x: pos.x,
        y: pos.y,
        content: 'Text',
        color: '#fbbf24',
        fontSize: 16,
      } as Omit<TextElement, 'id'>);
    } else if (toolMode === 'area') {
      addMapElement({
        type: 'area',
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        color: '#ef4444',
        opacity: 0.3,
        shape: 'rectangle',
      } as Omit<AreaElement, 'id'>);
    } else if (toolMode === 'teamToken') {
      const firstTeam = state.teams[0];
      if (firstTeam) {
        addMapElement({
          type: 'teamToken',
          x: pos.x,
          y: pos.y,
          teamId: firstTeam.id,
          size: 60,
        } as Omit<TeamTokenElement, 'id'>);
      }
    } else if (toolMode === 'playerToken') {
      const firstPlayer = state.players[0];
      if (firstPlayer) {
        addMapElement({
          type: 'playerToken',
          x: pos.x,
          y: pos.y,
          playerId: firstPlayer.id,
          size: 40,
        } as Omit<PlayerTokenElement, 'id'>);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      updateViewport({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
    } else if (isDraggingElement && selectedElement) {
      const pos = getMousePos(e);
      updateMapElement(selectedElement.id, {
        x: pos.x - dragOffset.x,
        y: pos.y - dragOffset.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (arrowStart && toolMode === 'arrow') {
      const pos = getMousePos(e);
      addMapElement({
        type: 'arrow',
        x: arrowStart.x,
        y: arrowStart.y,
        x2: pos.x,
        y2: pos.y,
        color: '#fbbf24',
        width: 3,
      } as Omit<ArrowElement, 'id'>);
      setArrowStart(null);
    }
    setIsPanning(false);
    setIsDraggingElement(false);
  };

  const findElementAtPosition = (x: number, y: number): MapElement | null => {
    for (let i = state.map.elements.length - 1; i >= 0; i--) {
      const el = state.map.elements[i];
      if (el.type === 'marker' || el.type === 'teamToken' || el.type === 'playerToken') {
        const size = el.type === 'marker' ? (el as MarkerElement).size : (el as TeamTokenElement | PlayerTokenElement).size;
        if (Math.abs(x - el.x) < size / 2 && Math.abs(y - el.y) < size / 2) {
          return el;
        }
      } else if (el.type === 'text') {
        const textEl = el as TextElement;
        if (x >= el.x - 50 && x <= el.x + 50 && y >= el.y - 20 && y <= el.y + 20) {
          return el;
        }
      } else if (el.type === 'area') {
        const areaEl = el as AreaElement;
        if (x >= el.x && x <= el.x + areaEl.width && y >= el.y && y <= el.y + areaEl.height) {
          return el;
        }
      } else if (el.type === 'arrow') {
        const arrowEl = el as ArrowElement;
        const dist = distanceToLine(x, y, el.x, el.y, arrowEl.x2, arrowEl.y2);
        if (dist < 10) {
          return el;
        }
      }
    }
    return null;
  };

  const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleZoomIn = () => {
    updateViewport({ zoom: Math.min(5, viewport.zoom * 1.2) });
  };

  const handleZoomOut = () => {
    updateViewport({ zoom: Math.max(0.1, viewport.zoom / 1.2) });
  };

  const handleResetView = () => {
    updateViewport({ zoom: 1, panX: 0, panY: 0 });
  };

  return (
    <div className="flex-1 relative bg-stone-950 overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : toolMode === 'select' ? 'default' : 'crosshair' }}
      >
        <div
          style={{
            transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {backgroundImage && (
            <img
              src={state.map.backgroundImage!.url}
              alt="Map"
              style={{
                width: state.map.backgroundImage!.width,
                height: state.map.backgroundImage!.height,
                pointerEvents: 'none',
                opacity: 0.7,
              }}
            />
          )}

          <svg
            width={backgroundImage ? state.map.backgroundImage!.width : 2000}
            height={backgroundImage ? state.map.backgroundImage!.height : 2000}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {state.map.elements.map((el) => (
              <ElementRenderer
                key={el.id}
                element={el}
                isSelected={selectedElement?.id === el.id}
                state={state}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-stone-800/90 border border-amber-600/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-stone-700 hover:border-amber-500 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-stone-800/90 border border-amber-600/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-stone-700 hover:border-amber-500 transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-stone-800/90 border border-amber-600/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-stone-700 hover:border-amber-500 transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-4 left-4 bg-stone-800/90 border border-amber-600/50 rounded-lg px-3 py-2 text-amber-400 text-sm">
        Zoom: {Math.round(viewport.zoom * 100)}% | Pan: Hold Shift+Drag or Middle Mouse
      </div>
    </div>
  );
}

function ElementRenderer({
  element,
  isSelected,
  state,
}: {
  element: MapElement;
  isSelected: boolean;
  state: any;
}) {
  if (element.type === 'area') {
    const el = element as AreaElement;
    return (
      <g>
        {el.shape === 'rectangle' ? (
          <rect
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            fill={el.color}
            opacity={el.opacity}
            stroke={isSelected ? '#fbbf24' : el.color}
            strokeWidth={isSelected ? 3 : 1}
          />
        ) : (
          <circle
            cx={el.x + el.width / 2}
            cy={el.y + el.height / 2}
            r={el.width / 2}
            fill={el.color}
            opacity={el.opacity}
            stroke={isSelected ? '#fbbf24' : el.color}
            strokeWidth={isSelected ? 3 : 1}
          />
        )}
      </g>
    );
  }

  if (element.type === 'arrow') {
    const el = element as ArrowElement;
    const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
    return (
      <g>
        <line
          x1={el.x}
          y1={el.y}
          x2={el.x2}
          y2={el.y2}
          stroke={el.color}
          strokeWidth={el.width}
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={el.color} />
          </marker>
        </defs>
        {isSelected && (
          <>
            <circle cx={el.x} cy={el.y} r="5" fill="#fbbf24" />
            <circle cx={el.x2} cy={el.y2} r="5" fill="#fbbf24" />
          </>
        )}
      </g>
    );
  }

  if (element.type === 'marker') {
    const el = element as MarkerElement;
    return (
      <g>
        <circle
          cx={el.x}
          cy={el.y}
          r={el.size / 2}
          fill={el.color}
          stroke={isSelected ? '#fbbf24' : '#000'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.8}
        />
        <text
          x={el.x}
          y={el.y + el.size / 2 + 15}
          textAnchor="middle"
          fill={el.color}
          fontSize="14"
          fontWeight="bold"
        >
          {el.label}
        </text>
      </g>
    );
  }

  if (element.type === 'text') {
    const el = element as TextElement;
    return (
      <g>
        {el.backgroundColor && (
          <rect
            x={el.x - 50}
            y={el.y - 15}
            width="100"
            height="30"
            fill={el.backgroundColor}
            opacity={0.7}
            rx="4"
          />
        )}
        <text
          x={el.x}
          y={el.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={el.color}
          fontSize={el.fontSize}
          fontWeight="bold"
          stroke={isSelected ? '#fbbf24' : 'none'}
          strokeWidth={isSelected ? 1 : 0}
        >
          {el.content}
        </text>
      </g>
    );
  }

  if (element.type === 'teamToken') {
    const el = element as TeamTokenElement;
    const team = state.teams.find((t: any) => t.id === el.teamId);
    if (!team) return null;
    return (
      <g>
        <circle
          cx={el.x}
          cy={el.y}
          r={el.size / 2}
          fill={team.color}
          stroke={isSelected ? '#fbbf24' : '#000'}
          strokeWidth={isSelected ? 4 : 3}
          opacity={0.9}
        />
        <text
          x={el.x}
          y={el.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="14"
          fontWeight="bold"
        >
          {team.name.split(' ')[0]}
        </text>
      </g>
    );
  }

  if (element.type === 'playerToken') {
    const el = element as PlayerTokenElement;
    const player = state.players.find((p: any) => p.id === el.playerId);
    if (!player) return null;
    const team = state.teams.find((t: any) => t.id === player.teamId);
    const color = team?.color || '#6b7280';
    return (
      <g>
        <circle
          cx={el.x}
          cy={el.y}
          r={el.size / 2}
          fill={color}
          stroke={isSelected ? '#fbbf24' : '#000'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={0.9}
        />
        <text
          x={el.x}
          y={el.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="10"
          fontWeight="bold"
        >
          {player.name.slice(0, 3).toUpperCase()}
        </text>
      </g>
    );
  }

  return null;
}
