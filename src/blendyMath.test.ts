import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cover,
  easeOutQuad,
  computeParallaxK,
  computeSceneScale,
  computeCropLayout,
  computeWordMetrics,
  computeTabDirection,
} from './blendyMath';

test('cover(t) matches measured table endpoints and smoothstep interpolation', () => {
  assert.equal(cover(0), 0);
  assert.equal(cover(1), 1);
  assert.equal(cover(-0.2), 0);
  assert.equal(cover(1.5), 1);
  // Exact table points
  assert.ok(Math.abs(cover(0.485) - 0.158) < 1e-6);
  assert.ok(Math.abs(cover(0.583) - 0.55) < 1e-6);
  // Monotonically increasing
  let prev = 0;
  for (let i = 1; i <= 100; i++) {
    const cur = cover(i / 100);
    assert.ok(cur >= prev, `cover(${i / 100}) decreased`);
    prev = cur;
  }
});

test('parallax k starts at t=0.5 and settles to 1 by t=0.92', () => {
  assert.equal(computeParallaxK(0), 0);
  assert.equal(computeParallaxK(0.5), 0);
  assert.ok(computeParallaxK(0.71) > 0.7 && computeParallaxK(0.71) < 0.8);
  assert.equal(computeParallaxK(0.92), 1);
  assert.equal(computeParallaxK(1), 1);
  assert.equal(easeOutQuad(0.5), 0.75);
});

test('scene scale selects desktop vs mobile rules correctly', () => {
  const desktop = computeSceneScale(1440, 900);
  assert.equal(desktop.mobile, false);
  assert.equal(desktop.u, 1);
  assert.equal(desktop.fy, 0);

  const landscapePhone = computeSceneScale(844, 390);
  assert.equal(landscapePhone.mobile, false);
  assert.ok(Math.abs(landscapePhone.u - 390 / 900) < 1e-6);

  const mobile = computeSceneScale(390, 844);
  assert.equal(mobile.mobile, true);
  assert.ok(Math.abs(mobile.u - 390 / 640) < 1e-6);
  assert.equal(mobile.fy, 8);

  const tallTablet = computeSceneScale(900, 1200);
  assert.equal(tallTablet.mobile, true);
});

test('crop layout scales sheet box accurately', () => {
  const berryBottle = computeCropLayout([233, 60, 598, 917], 372);
  const s = 372 / 598;
  assert.equal(berryBottle.width, 372);
  assert.ok(Math.abs(berryBottle.height - 917 * s) < 1e-6);
  assert.ok(Math.abs(berryBottle.bgSize - 2048 * s) < 1e-6);
  assert.ok(Math.abs(berryBottle.bgPosX - -233 * s) < 1e-6);
  assert.ok(Math.abs(berryBottle.bgPosY - -60 * s) < 1e-6);
});

test('word metrics match desktop reference sizes and tops', () => {
  // Berry (short word)
  const berry = computeWordMetrics(265, 250, 1440, 1, false);
  assert.equal(berry.fontSize, 445);
  assert.equal(berry.letterSpacingEm, 0.005);
  assert.equal(Math.round(berry.top), 181);

  // Banana (~372px)
  const banana = computeWordMetrics(390, 376.34, 1440, 1, false);
  assert.equal(banana.letterSpacingEm, -0.035);
  assert.equal(Math.round(banana.fontSize), 372);
  assert.equal(Math.round(banana.top), 217);

  // Strawberry (~257px)
  const strawberry = computeWordMetrics(565, 544.75, 1440, 1, false);
  assert.equal(strawberry.letterSpacingEm, -0.035);
  assert.equal(Math.round(strawberry.fontSize), 257);
  assert.equal(Math.round(strawberry.top), 275);
});

test('tab direction determines forward or backward wipe', () => {
  assert.equal(computeTabDirection(0, 2), 1);
  assert.equal(computeTabDirection(3, 1), -1);
});
