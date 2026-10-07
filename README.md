# بومک

Persian isometric city clicker prototype.

## Current direction

- Clean isometric grid and projection
- Procedural building generation
- Buildings placed directly on the map
- Manual click income
- Residential buildings generate auto-clicks
- Urban buildings increase auto-click
- Production buildings increase click value
- Production near residential buildings reduces residential auto-click
- Building geometry and economy are separate systems

## Architecture

src/
- main.js
- core/GameState.js
- core/Economy.js
- core/Rules.js
- map/Grid.js
- map/IsoProjection.js
- map/Placement.js
- buildings/Building.js
- buildings/BuildingRegistry.js
- buildings/Generator.js
- buildings/generators/residential.js
- buildings/generators/urban.js
- buildings/generators/production.js
- renderer/Renderer.js
- renderer/GridRenderer.js
- renderer/BuildingRenderer.js
- ui/Shop.js
- ui/HUD.js

See docs/ARCHITECTURE.md for the current design.

## Principle

The generator produces geometry. The renderer draws geometry. The economy evaluates buildings and positions. Neither system should own the other's logic.
