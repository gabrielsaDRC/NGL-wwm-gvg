import { AppProvider } from './context/AppContext';
import { RosterPanel } from './components/RosterPanel';
import { MapCanvas } from './components/MapCanvas';
import { ToolsPanel } from './components/ToolsPanel';
import { Swords } from 'lucide-react';

function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-stone-950">
        <header className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border-b-2 border-amber-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Where Winds Meet
              </h1>
              <p className="text-xs text-amber-200/70">GvG Strategy Planner</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-amber-400 font-semibold">30v30 Guild War</div>
            <div className="text-xs text-amber-200/70">Plan • Coordinate • Conquer</div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <RosterPanel />
          <MapCanvas />
          <ToolsPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
