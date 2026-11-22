/**
 * Pure math and layout calculations for the Blendy flavour slider.
 * Tested independently via node:test and mirrored identically in index.html.
 */

export const COVERAGE_TABLE: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.031, 0.006],
  [0.134, 0.012],
  [0.206, 0.023],
  [0.278, 0.047],
  [0.34, 0.07],
  [0.412, 0.105],
  [0.485, 0.158],
  [0.546, 0.246],
  [0.583, 0.55],
  [0.62, 0.825],
  [0.69, 0.9],
  [0.79, 0.94],
  [0.85, 0.956],
  [0.93, 0.975],
  [1, 1],
];

export const LAYER_PARALLAX_FACTORS = {
  word: 0.4,
  shadow: 0.3,
  bottle: 0.15,
  fruit: 0.55,
  corner: 0.75,
} as const;

export function smoothstep(k: number): number {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
}

export function cover(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 0; i < COVERAGE_TABLE.length - 1; i++) {
    const [t0, c0] = COVERAGE_TABLE[i];
    const [t1, c1] = COVERAGE_TABLE[i + 1];
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return c0 + (c1 - c0) * smoothstep(k);
    }
  }
  return 1;
}

export function easeOutQuad(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return 1 - (1 - c) * (1 - c);
}

export function computeParallaxK(t: number): number {
  return easeOutQuad((t - 0.5) / 0.42);
}

export function isMobileViewport(vw: number, vh: number): boolean {
  return vw <= 820 || vh > vw;
}

export function computeSceneScale(vw: number, vh: number): {
  mobile: boolean;
  u: number;
  fy: number;
} {
  const mobile = isMobileViewport(vw, vh);
  if (mobile) {
    const u = Math.max(0.1, Math.min(vw / 640, (vh - 200) / 620));
    return {mobile: true, u, fy: 8};
  }
  const u = Math.min(vw / 1440, vh / 900);
  return {mobile: false, u, fy: 0};
}

export interface CropLayout {
  width: number;
  height: number;
  bgSize: number;
  bgPosX: number;
  bgPosY: number;
}

export function computeCropLayout(
  box: readonly [number, number, number, number],
  targetWidth: number,
  sheetSize = 2048,
): CropLayout {
  const [bx, by, bw, bh] = box;
  const s = targetWidth / bw;
  return {
    width: targetWidth,
    height: bh * s,
    bgSize: sheetSize * s,
    bgPosX: -bx * s,
    bgPosY: -by * s,
  };
}

export function computeWordMetrics(
  inkWidth100Default: number,
  inkWidth100Tight: number,
  vw: number,
  u: number,
  mobile: boolean,
): {
  fontSize: number;
  letterSpacingEm: number;
  top: number;
  baseline: number;
} {
  const ink445Default = inkWidth100Default * 4.45;
  const isLong = ink445Default > 1330;
  const letterSpacingEm = isLong ? -0.035 : 0.005;
  const ink100 = isLong ? inkWidth100Tight : inkWidth100Default;

  let fontSize = 445;
  if (mobile) {
    const visibleWidth = Math.min(1440, vw / u) * 0.92;
    fontSize = Math.min(445, (visibleWidth / ink100) * 100);
  } else if (isLong) {
    fontSize = Math.min(445, (1400 / ink100) * 100);
  }

  const baseline = 403.5 + (0.698 * fontSize) / 2;
  const top = baseline - 0.85 * fontSize;
  return {fontSize, letterSpacingEm, top, baseline};
}

export function computeTabDirection(currentIndex: number, targetIndex: number): 1 | -1 {
  return targetIndex > currentIndex ? 1 : -1;
}
