# Where Winds Meet - GvG Strategy Planner

A comprehensive web application for planning Guild vs Guild (GvG) strategies in Where Winds Meet, supporting up to 30 players across 6 teams.

## 🚀 Quick Deploy

```bash
# Install dependencies
npm install

# Deploy to GitHub Pages
npm run deploy
```

See [DEPLOY.md](DEPLOY.md) for detailed instructions.

## Features

### Player Management
- Add up to 30 players with customizable names and classes
- 7 player classes: Healer, Tank, DPS Strategic, DPS Silkbind, DPS Bamboo, DPS Nameless, DPS Misto
- Drag & drop players between teams
- Visual class distribution per team
- Search and filter unassigned players

### Team Organization
- 6 pre-configured teams with customizable names and colors
- Visual team roster with member counts
- Class composition overview
- Easy team reassignment via drag & drop

### Interactive Map Canvas
- Upload custom background images for your map
- Zoom and pan controls (mouse wheel + shift+drag or middle mouse)
- Multiple annotation tools:
  - **Markers**: Place strategic points with custom colors and labels
  - **Text**: Add notes and labels directly on the map
  - **Arrows**: Draw movement paths and engagement routes
  - **Areas**: Highlight zones with rectangles or circles
  - **Team Tokens**: Position team locations with automatic color coding
  - **Player Tokens**: Place individual player positions

### Map Elements
- Selectable and draggable elements
- Customizable properties (color, size, opacity, labels)
- Layer system for organizing annotations
- Delete individual elements or clear all markings
- **Undo/Redo**: Revert or restore changes (up to 50 actions)

### Strategy Planning
- Strategy notes section for briefing and tactics
- Export entire strategy to JSON file
- Import saved strategies to restore complete state
- Automatic local save (localStorage) - never lose your work

### Data Persistence
- Auto-save to browser localStorage with debouncing
- Export/Import JSON for sharing and backup
- Maintains all data: players, teams, map elements, viewport state

## Usage

### Getting Started
1. **Add Players**: Click "Add Player" to create your roster
2. **Assign Teams**: Drag players to teams in the left panel
3. **Upload Map**: Use the "Upload Background" button in the right panel
4. **Plan Strategy**:
   - Select tools from the right panel
   - Click on the map to place elements
   - Drag elements to reposition
   - Click to select and edit properties

### Controls
- **Zoom**: Mouse wheel or zoom buttons (bottom right)
- **Pan**: Hold Shift + Drag or Middle Mouse Button
- **Select**: Click on any map element
- **Delete**: Select element and click trash icon or Delete key
- **Drag Elements**: Select tool, click and drag existing elements

### Export/Import
- **Export JSON**: Download your complete strategy plan
- **Import JSON**: Load a previously saved strategy
- **Auto-save**: Changes are automatically saved to your browser

### Tools
- **Select**: Click to select and move existing elements
- **Marker**: Place strategic markers with labels
- **Text**: Add text annotations
- **Arrow**: Draw directional arrows (click start, then end point)
- **Area**: Create highlighted zones
- **Team Token**: Place team position markers
- **Player Token**: Place individual player markers

## Technical Details

### Built With
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- HTML5 Canvas for map rendering

### Browser Support
- Modern browsers with localStorage support
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment. To deploy:

```bash
npm run build
```

The build output in `dist/` can be deployed to GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

## License

This is a fan-made tool for Where Winds Meet and is not affiliated with the game developers.
