# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **魔方还原助手** (Rubik's Cube Solver Assistant) project - a WeChat Mini Program for solving 3x3 Rubik's cubes. The project is currently in the planning/design phase.

## Project Structure

- `魔方还原助手微信小程序需求文档v1.md` - Comprehensive product requirements document (PRD) in Chinese
- `ui/` - UI mockups and screenshots showing the planned user interface
  - Contains images showing cube color checking, step counting, and solving interface
- `11fc12f5-7a21-452a-bf24-a9f1a55a71c1` - PNG image (likely additional UI mockup)

## Key Features (From Requirements)

1. **Cube State Input**
   - Manual color input by clicking squares
   - Camera-based color recognition
   - Reset functionality

2. **Cube State Display**
   - 3D rotatable cube model
   - Standard color scheme: white top, yellow bottom, green-red-blue-orange sides (clockwise)
   - Initial display shows center colors as reference

3. **Solving Algorithm**
   - Uses Kociemba algorithm for optimal solving
   - Step-by-step solution display
   - Interactive playback with speed control

4. **UI Components**
   - Step progress indicator
   - Navigation controls (back, previous, next, auto-play)
   - Speed adjustment slider
   - Share functionality
   - Ad banner placement areas

## Development Status

This appears to be a **planning/requirements phase project** with no actual code implementation yet. The repository contains:
- Detailed Chinese PRD document
- UI mockups and design references
- No source code, package.json, or build configuration

## Next Steps for Development

When implementing this project, consider:
1. Choose framework (likely WeChat Mini Program framework)
2. Implement 3D cube visualization
3. Integrate Kociemba solving algorithm
4. Build camera-based color recognition
5. Create interactive UI matching the mockups

## Language Notes

Primary documentation is in Chinese. The target platform is WeChat Mini Program (微信小程序).