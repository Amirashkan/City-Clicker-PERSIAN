import test from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, createBuilding, getUpgradeCost } from '../src/buildings/registry.js';
import { generateBuilding } from '../src/buildings/generator.js';
import { calculateEconomy, evaluateBuilding, getLevelStats } from '../src/core/Rules.js';

test('every registered building can be generated with valid geometry data', () => {
  for (const type of Object.keys(BUILDINGS)) {
    const b = generateBuilding(type, { x: 2, y: 3, seed: 0.123, level: 1 });
    assert.equal(b.x, 2);
    assert.equal(b.y, 3);
    assert.equal(b.level, 1);
    assert.ok(Number.isFinite(b.w));
    assert.ok(Number.isFinite(b.d));
    assert.ok(Number.isFinite(b.height));
  }
});

test('building generation is deterministic for the same seed', () => {
  assert.deepEqual(
    generateBuilding('house', { x: 1, y: 2, seed: 0.42 }),
    generateBuilding('house', { x: 1, y: 2, seed: 0.42 })
  );
});

test('all building types have an upgrade path from level 1 to 3', () => {
  for (const type of Object.keys(BUILDINGS)) {
    const first = getUpgradeCost(type, 1);
    const second = getUpgradeCost(type, 2);
    assert.ok(first > 0);
    assert.ok(second > 0);
    assert.equal(getUpgradeCost(type, 3), null);
  }
});

test('level stats increase predictably', () => {
  assert.deepEqual(getLevelStats(1), { multiplier: 1, radius: 2 });
  assert.deepEqual(getLevelStats(2), { multiplier: 1.5, radius: 2 });
  assert.deepEqual(getLevelStats(3), { multiplier: 2, radius: 3 });
});

test('economy starts with base click value and house income', () => {
  const house = createBuilding('house', { x: 0, y: 0 });
  const economy = calculateEconomy([house]);
  assert.equal(economy.clickValue, 1);
  assert.equal(economy.autoClick, 1);
});

test('upgrade level changes building effects without changing its type', () => {
  const house = createBuilding('house', { x: 0, y: 0 });
  const before = evaluateBuilding(house, [house]);
  house.level = 2;
  const after = evaluateBuilding(house, [house]);
  assert.equal(house.type, 'house');
  assert.equal(after.effectMultiplier, 1.5);
  assert.ok(after.autoClick > before.autoClick);
});

test('nearby buildings affect economy according to their rules', () => {
  const house = createBuilding('house', { x: 0, y: 0 });
  const shop = createBuilding('shop', { x: 1, y: 0 });
  const withoutShop = evaluateBuilding(house, [house]);
  const withShop = evaluateBuilding(house, [house, shop]);
  assert.ok(withShop.autoClick > withoutShop.autoClick);
});

test('far buildings do not affect each other', () => {
  const house = createBuilding('house', { x: 0, y: 0 });
  const shop = createBuilding('shop', { x: 10, y: 10 });
  assert.equal(evaluateBuilding(house, [house, shop]).autoClick, 1);
});
