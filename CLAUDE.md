# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **魔方还原助手** (Rubik's Cube Solver Assistant) - a WeChat Mini Program for solving 3x3 Rubik's cubes. The project uses hybrid rendering technology combining CSS 3D transforms with Canvas 2D rendering.

## Development Environment

- **Platform**: WeChat Mini Program (微信小程序)
- **Framework**: Native WeChat Mini Program development
- **Required Tools**: WeChat Developer Tools v1.06+
- **Base Library**: 2.19.4+
- **Language**: ES6+ with WeChat Mini Program APIs

## Running the Project

1. Open project in WeChat Developer Tools
2. Configure AppID in `project.config.json` (currently set to "your_app_id_here")
3. Click compile and run

## Project Architecture

### Core Technologies
- **3D Rendering**: CSS 3D transforms for cube structure + Canvas 2D for face rendering
- **Performance**: WXS scripts for gesture handling to avoid main thread blocking
- **Algorithm**: Simplified Kociemba algorithm implementation for cube solving
- **Storage**: wx.setStorage for local data persistence

### Key Components

#### HybridCube Component (`components/hybridCube/`)
- **Purpose**: Main 3D cube display and interaction
- **Tech**: Hybrid rendering (CSS 3D structure + Canvas face content)
- **Features**: Touch rotation, click-to-paint, real-time face rendering
- **Files**: 
  - `hybridCube.js` - Main component logic
  - `gesture.wxs` - WXS gesture handling for performance
  - `hybridCube.wxss` - 3D CSS transforms and styling

#### Advanced Rendering (`utils/advancedCubeRenderer.js`)
- Frame caching and optimization
- Offscreen canvas rendering
- Animation loop management

### Page Structure
- `pages/index/` - Main input page (cube coloring interface)
- `pages/solver/` - Solution display page (step-by-step solving)

### Utility Modules
- `utils/kociemba.js` - Simplified Kociemba solving algorithm
- `models/cube.js` - Cube state data model
- `utils/cubeRenderer.js` - Canvas rendering utilities
- `utils/common.js` - Shared utility functions

## Cube State Format

Cube state uses standard face notation:
- F (Front), B (Back), L (Left), R (Right), U (Up), D (Down)
- Each face has 9 positions (3x3 grid)
- Colors: 'empty', 'white', 'yellow', 'green', 'blue', 'orange', 'red'

## Development Notes

### Performance Considerations
- Use WXS for high-frequency touch events to avoid main thread communication overhead
- Canvas rendering is optimized with frame caching in AdvancedCubeRenderer
- CSS 3D transforms provide hardware-accelerated cube rotation

### Component Integration
- HybridCube component accepts `cubeState` and `selectedColor` props
- Emits `cubeClick` events with face and position data
- Automatically re-renders when state changes via observers

### Testing
- No automated test framework configured
- Testing primarily done through WeChat Developer Tools simulator
- Manual testing on actual WeChat app required for production

## Common Tasks

### Adding New Cube Rendering Features
1. Modify `components/hybridCube/hybridCube.js` for component logic
2. Update `utils/advancedCubeRenderer.js` for rendering optimizations  
3. Adjust CSS in `hybridCube.wxss` for visual changes

### Extending Solving Algorithm
1. Modify `utils/kociemba.js` for algorithm improvements
2. Update solver page in `pages/solver/` for UI changes
3. Ensure cube state model in `models/cube.js` supports new features

### Adding New Pages
1. Create page directory under `pages/`
2. Add page path to `app.json` pages array
3. Follow existing page structure (js/wxml/wxss/json files)