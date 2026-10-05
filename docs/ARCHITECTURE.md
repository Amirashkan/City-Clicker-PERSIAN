# Architecture

## 1. Building data

A building is data, not a renderer object.

Example fields:
id, type, level, variant, seed, x, y

The seed makes procedural geometry reproducible.

## 2. Isometric projection

There must be one projection used by everything on the map.

screenX = originX + (x - y) * tileWidth / 2
screenY = originY + (x + y) * tileHeight / 2 - z

Buildings, roofs, windows, water coolers, trees and grid tiles must use the same coordinate system.

Projection belongs in map/IsoProjection.js, not inside individual building renderers.

## 3. Generator

The pipeline is:

Building definition
  -> Generator
  -> Geometry
  -> Renderer

The generator should not know about money.

The renderer should not know whether a building is economically useful.

## 4. Economy

The pipeline is:

Buildings + Positions
  -> Rules
  -> Economy
  -> GameState

Manual income:
money += clickValue

Residential buildings provide base auto-click capacity.

Urban buildings such as shop, bakery and park increase auto-click.

Production buildings such as workshop and farm increase clickValue.

## 5. Local production penalty

Production creates a spatial trade-off.

Initial simple rule:
- distance <= 1: full penalty
- distance == 2: half penalty
- distance >= 3: no penalty

Do not permanently mutate a residential building's base value.

Calculate effective auto-click from the complete city instead.

effectiveAutoClick =
  residentialBase
  + urbanBonus
  - productionPenalty

Moving a workshop therefore changes the economy automatically.

## 6. Building registry

Buildings should be data-driven.

Each definition can provide:
- type
- cost
- economy effects
- generator

Adding a new building should not require changes to the core renderer.

## 7. Initial building set

Keep the first version small:
- house
- shop
- bakery
- park
- workshop
- farm

The UI does not need a complex category system yet.

Levels, variants, unlocking, upgrades, roads, neighbourhoods and pollution can be added later.

## 8. Procedural Iranian visual direction

The residential generator should create recognizable Iranian urban details procedurally rather than using images:
- brick or concrete facade
- Iranian urban proportions
- rooftop parapet
- blue or metal window frames
- visible water cooler
- rooftop water tank
- simple balconies or awnings

The water cooler is a generated component and must use the same isometric projection as the building.

## 9. Keep the prototype simple

Do not solve progression, content catalogs or elaborate UI before projection, generator, placement and economy are stable.
