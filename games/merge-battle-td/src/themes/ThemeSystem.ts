import { TowerType, EnemyType } from '../config';

export type ThemeId = 'cell' | 'origami' | 'stainedglass';

export interface TowerVisual {
  color: number;
  glowColor: number;
  shape: 'circle' | 'rect' | 'diamond' | 'hexagon' | 'organic';
  outlineWidth: number;
  outlineColor: number;
  alpha: number;
}

export interface EnemyVisual {
  color: number;
  shape: 'circle' | 'triangle' | 'rect' | 'blob' | 'rod' | 'crystal';
  radius: number;
  alpha: number;
  outlineColor: number;
  outlineWidth: number;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameKo: string;
  background: number;
  gridCellColor: number;
  gridCellAlpha: number;
  gridLineColor: number;
  gridLineAlpha: number;
  pathColor: number;
  pathAlpha: number;
  pathLineColor: number;
  pathLineWidth: number;
  hudBgColor: number;
  hudBgAlpha: number;
  hudTextColor: string;
  hudAccentColor: string;
  panelBgColor: number;
  panelBgAlpha: number;
  towerVisuals: Record<TowerType, TowerVisual>;
  enemyVisuals: Record<EnemyType, EnemyVisual>;
  projectileColor: number;
  projectileGlow: number;
  mergeParticleColors: number[];
  deathParticleColor: number;
  hitFlashColor: number;
  // Custom draw functions
  drawTower?: (gfx: Phaser.GameObjects.Graphics, type: TowerType, tier: number, size: number) => void;
  drawEnemy?: (gfx: Phaser.GameObjects.Graphics, type: EnemyType) => void;
  drawGrid?: (gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, isPath: boolean) => void;
  drawPath?: (gfx: Phaser.GameObjects.Graphics, waypoints: Phaser.Math.Vector2[]) => void;
}

// Import is deferred to avoid circular deps
import Phaser from 'phaser';

// ═══════════════════════════════════════════
// THEME 1: 세포/면역 생물학
// ═══════════════════════════════════════════
export const CELL_THEME: ThemeConfig = {
  id: 'cell',
  name: 'Cell Biology',
  nameKo: '세포/면역 생물학',
  background: 0x0a1520,
  gridCellColor: 0x112233,
  gridCellAlpha: 0.4,
  gridLineColor: 0x1a4466,
  gridLineAlpha: 0.5,
  pathColor: 0x1a3344,
  pathAlpha: 0.5,
  pathLineColor: 0x33aacc,
  pathLineWidth: 6,
  hudBgColor: 0x0a1520,
  hudBgAlpha: 0.95,
  hudTextColor: '#66ccee',
  hudAccentColor: '#88ffaa',
  panelBgColor: 0x081018,
  panelBgAlpha: 0.95,
  towerVisuals: {
    archer: { color: 0x88ff88, glowColor: 0x44ff44, shape: 'organic', outlineWidth: 2, outlineColor: 0xaaffaa, alpha: 0.85 },
    cannon: { color: 0xff8888, glowColor: 0xff4444, shape: 'organic', outlineWidth: 2, outlineColor: 0xffaaaa, alpha: 0.85 },
    slow:   { color: 0x88aaff, glowColor: 0x4488ff, shape: 'organic', outlineWidth: 2, outlineColor: 0xaaccff, alpha: 0.85 },
  },
  enemyVisuals: {
    goblin: { color: 0xcc3333, shape: 'blob', radius: 10, alpha: 0.9, outlineColor: 0xff6666, outlineWidth: 1 },
    wolf:   { color: 0x9933cc, shape: 'rod', radius: 10, alpha: 0.9, outlineColor: 0xcc66ff, outlineWidth: 1 },
    troll:  { color: 0x669966, shape: 'blob', radius: 16, alpha: 0.9, outlineColor: 0x99cc99, outlineWidth: 2 },
  },
  projectileColor: 0xaaffaa,
  projectileGlow: 0x44ff44,
  mergeParticleColors: [0x88ff88, 0xaaffaa, 0xffffff],
  deathParticleColor: 0xff6644,
  hitFlashColor: 0xaaffaa,
  drawTower: (gfx, type, tier, size) => {
    const colors = { archer: 0x88ff88, cannon: 0xff8888, slow: 0x88aaff };
    const glows = { archer: 0x44ff44, cannon: 0xff4444, slow: 0x4488ff };
    const c = colors[type];
    const g = glows[type];

    // Outer membrane glow
    gfx.fillStyle(g, 0.15);
    gfx.fillCircle(0, 0, size + 8);

    // Cell body (organic blob shape using multiple circles)
    gfx.fillStyle(c, 0.3);
    gfx.fillCircle(0, 0, size + 3);
    gfx.fillStyle(c, 0.7);
    gfx.fillCircle(0, 0, size);

    // Nucleus
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(0, 0, size * 0.4);
    gfx.fillStyle(c, 0.9);
    gfx.fillCircle(0, 0, size * 0.25);

    // Membrane outline
    gfx.lineStyle(2, c, 0.6);
    gfx.strokeCircle(0, 0, size);

    // Organelles for higher tiers
    if (tier >= 2) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const ox = Math.cos(angle) * size * 0.6;
        const oy = Math.sin(angle) * size * 0.6;
        gfx.fillStyle(c, 0.5);
        gfx.fillCircle(ox, oy, 4);
      }
    }
    if (tier >= 3) {
      // Pulsing outer ring
      gfx.lineStyle(1, 0xffffff, 0.3);
      gfx.strokeCircle(0, 0, size + 5);
      // Extra organelles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const ox = Math.cos(angle) * size * 0.75;
        const oy = Math.sin(angle) * size * 0.75;
        gfx.fillStyle(0xffffff, 0.3);
        gfx.fillCircle(ox, oy, 2);
      }
    }
  },
  drawEnemy: (gfx, type) => {
    const visuals = CELL_THEME.enemyVisuals[type];
    const r = visuals.radius;

    if (type === 'wolf') {
      // Rod-shaped bacteria
      gfx.fillStyle(visuals.color, 0.8);
      gfx.fillRoundedRect(-r * 1.5, -r * 0.5, r * 3, r, r * 0.5);
      gfx.lineStyle(1, visuals.outlineColor, 0.5);
      gfx.strokeRoundedRect(-r * 1.5, -r * 0.5, r * 3, r, r * 0.5);
      // Flagella
      gfx.lineStyle(1, visuals.outlineColor, 0.4);
      gfx.beginPath();
      gfx.moveTo(r * 1.5, 0);
      gfx.lineTo(r * 2, -3);
      gfx.lineTo(r * 2.5, 2);
      gfx.strokePath();
    } else if (type === 'troll') {
      // Large tumor cell
      gfx.fillStyle(visuals.color, 0.3);
      gfx.fillCircle(0, 0, r + 4);
      gfx.fillStyle(visuals.color, 0.7);
      gfx.fillCircle(0, 0, r);
      gfx.fillStyle(visuals.color, 0.9);
      gfx.fillCircle(-2, -2, r * 0.5);
      gfx.lineStyle(visuals.outlineWidth, visuals.outlineColor, 0.4);
      gfx.strokeCircle(0, 0, r);
      // Irregular bumps
      gfx.fillStyle(visuals.color, 0.5);
      gfx.fillCircle(r * 0.7, -r * 0.5, 4);
      gfx.fillCircle(-r * 0.5, r * 0.6, 3);
    } else {
      // Virus (goblin) - spiky sphere
      gfx.fillStyle(visuals.color, 0.7);
      gfx.fillCircle(0, 0, r);
      // Spike proteins
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const sx = Math.cos(angle) * (r + 4);
        const sy = Math.sin(angle) * (r + 4);
        gfx.fillStyle(visuals.color, 0.9);
        gfx.fillCircle(sx, sy, 2);
        gfx.lineStyle(1, visuals.outlineColor, 0.4);
        gfx.lineBetween(Math.cos(angle) * r, Math.sin(angle) * r, sx, sy);
      }
      gfx.fillStyle(0xffffff, 0.3);
      gfx.fillCircle(-2, -2, r * 0.3);
    }
  },
  drawGrid: (gfx, x, y, w, h, isPath) => {
    if (isPath) {
      gfx.fillStyle(0x1a3344, 0.5);
    } else {
      gfx.fillStyle(0x112233, 0.4);
    }
    gfx.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
    gfx.lineStyle(1, 0x1a4466, 0.5);
    gfx.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
  },
  drawPath: (gfx, waypoints) => {
    // Organic flowing path
    gfx.lineStyle(6, 0x33aacc, 0.4);
    gfx.beginPath();
    gfx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      gfx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gfx.strokePath();
    // Inner glow
    gfx.lineStyle(2, 0x66ddee, 0.3);
    gfx.beginPath();
    gfx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      gfx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gfx.strokePath();
  },
};

// ═══════════════════════════════════════════
// THEME 2: 종이접기/페이퍼크래프트
// ═══════════════════════════════════════════
export const ORIGAMI_THEME: ThemeConfig = {
  id: 'origami',
  name: 'Origami',
  nameKo: '종이접기/페이퍼크래프트',
  background: 0xf5f0e8,
  gridCellColor: 0xe8ddd0,
  gridCellAlpha: 0.8,
  gridLineColor: 0xccbbaa,
  gridLineAlpha: 0.6,
  pathColor: 0xd4c8b8,
  pathAlpha: 0.7,
  pathLineColor: 0xaa9988,
  pathLineWidth: 3,
  hudBgColor: 0xe8ddd0,
  hudBgAlpha: 0.95,
  hudTextColor: '#5a4a3a',
  hudAccentColor: '#cc6644',
  panelBgColor: 0xddd0c0,
  panelBgAlpha: 0.95,
  towerVisuals: {
    archer: { color: 0x66bb66, glowColor: 0x88dd88, shape: 'diamond', outlineWidth: 2, outlineColor: 0x446644, alpha: 0.95 },
    cannon: { color: 0xdd5544, glowColor: 0xff7766, shape: 'diamond', outlineWidth: 2, outlineColor: 0x883322, alpha: 0.95 },
    slow:   { color: 0x5588cc, glowColor: 0x77aaee, shape: 'diamond', outlineWidth: 2, outlineColor: 0x334466, alpha: 0.95 },
  },
  enemyVisuals: {
    goblin: { color: 0xcc4433, shape: 'triangle', radius: 10, alpha: 0.95, outlineColor: 0x882211, outlineWidth: 2 },
    wolf:   { color: 0x8844aa, shape: 'triangle', radius: 10, alpha: 0.95, outlineColor: 0x553377, outlineWidth: 2 },
    troll:  { color: 0x888888, shape: 'rect', radius: 16, alpha: 0.95, outlineColor: 0x555555, outlineWidth: 2 },
  },
  projectileColor: 0x554433,
  projectileGlow: 0x887766,
  mergeParticleColors: [0xffcc44, 0xff9944, 0xffeedd],
  deathParticleColor: 0xccbbaa,
  hitFlashColor: 0xffeedd,
  drawTower: (gfx, type, tier, size) => {
    const colors: Record<TowerType, number> = { archer: 0x66bb66, cannon: 0xdd5544, slow: 0x5588cc };
    const darks: Record<TowerType, number> = { archer: 0x446644, cannon: 0x883322, slow: 0x334466 };
    const lights: Record<TowerType, number> = { archer: 0x88dd88, cannon: 0xff7766, slow: 0x77aaee };
    const c = colors[type];
    const d = darks[type];
    const l = lights[type];

    // Shadow
    gfx.fillStyle(0x000000, 0.1);
    gfx.fillRect(-size + 3, -size + 3, size * 2, size * 2);

    // Main diamond shape (rotated square)
    const s = size;
    // Bottom-right half (darker = fold shadow)
    gfx.fillStyle(d, 0.9);
    gfx.fillTriangle(0, -s, s, 0, 0, s);
    gfx.fillTriangle(0, -s, 0, s, -s, 0);

    // Top-left half (lighter = paper surface)
    gfx.fillStyle(c, 0.95);
    gfx.fillTriangle(0, -s, s, 0, 0, 0);
    gfx.fillTriangle(0, -s, -s, 0, 0, 0);

    // Highlight fold
    gfx.fillStyle(l, 0.3);
    gfx.fillTriangle(0, -s, s * 0.3, -s * 0.3, -s * 0.3, -s * 0.3);

    // Fold crease lines
    gfx.lineStyle(1, d, 0.6);
    gfx.lineBetween(-s, 0, s, 0);
    gfx.lineBetween(0, -s, 0, s);

    // Outline
    gfx.lineStyle(2, d, 0.8);
    gfx.beginPath();
    gfx.moveTo(0, -s);
    gfx.lineTo(s, 0);
    gfx.lineTo(0, s);
    gfx.lineTo(-s, 0);
    gfx.closePath();
    gfx.strokePath();

    // Tier marks (small triangles)
    for (let i = 0; i < tier; i++) {
      const tx = -size + 8 + i * 10;
      const ty = size - 6;
      gfx.fillStyle(0xffffff, 0.7);
      gfx.fillTriangle(tx, ty, tx + 4, ty, tx + 2, ty - 4);
    }
  },
  drawEnemy: (gfx, type) => {
    const visuals = ORIGAMI_THEME.enemyVisuals[type];
    const r = visuals.radius;

    if (type === 'wolf') {
      // Origami crane shape
      gfx.fillStyle(visuals.color, 0.9);
      gfx.fillTriangle(0, -r, -r, r * 0.5, r, r * 0.5);
      // Fold line
      gfx.lineStyle(1, visuals.outlineColor, 0.5);
      gfx.lineBetween(0, -r, 0, r * 0.5);
      // Wings
      gfx.fillStyle(visuals.color, 0.7);
      gfx.fillTriangle(-r, r * 0.5, -r * 1.5, 0, 0, r * 0.5);
      gfx.fillTriangle(r, r * 0.5, r * 1.5, 0, 0, r * 0.5);
      gfx.lineStyle(visuals.outlineWidth, visuals.outlineColor, 0.8);
      gfx.strokeTriangle(0, -r, -r, r * 0.5, r, r * 0.5);
    } else if (type === 'troll') {
      // Origami box (big, folded)
      gfx.fillStyle(visuals.color, 0.85);
      gfx.fillRect(-r, -r, r * 2, r * 2);
      // Fold lines (X pattern)
      gfx.lineStyle(1, visuals.outlineColor, 0.4);
      gfx.lineBetween(-r, -r, r, r);
      gfx.lineBetween(r, -r, -r, r);
      // Top face lighter
      gfx.fillStyle(visuals.color, 0.5);
      gfx.fillTriangle(-r, -r, r, -r, 0, 0);
      gfx.lineStyle(visuals.outlineWidth, visuals.outlineColor, 0.8);
      gfx.strokeRect(-r, -r, r * 2, r * 2);
    } else {
      // Origami frog (goblin) - simple triangle with legs
      gfx.fillStyle(visuals.color, 0.9);
      gfx.fillTriangle(0, -r, -r, r, r, r);
      // Fold
      gfx.lineStyle(1, visuals.outlineColor, 0.4);
      gfx.lineBetween(0, -r, -r * 0.5, r * 0.5);
      gfx.lineBetween(0, -r, r * 0.5, r * 0.5);
      // Shadow half
      gfx.fillStyle(visuals.outlineColor, 0.3);
      gfx.fillTriangle(0, -r, r * 0.5, r * 0.5, r, r);
      gfx.lineStyle(visuals.outlineWidth, visuals.outlineColor, 0.8);
      gfx.strokeTriangle(0, -r, -r, r, r, r);
    }
  },
  drawGrid: (gfx, x, y, w, h, isPath) => {
    // Paper texture
    if (isPath) {
      gfx.fillStyle(0xd4c8b8, 0.7);
    } else {
      gfx.fillStyle(0xe8ddd0, 0.8);
    }
    gfx.fillRect(x, y, w, h);
    // Subtle paper grain lines
    gfx.lineStyle(1, 0xccbbaa, 0.3);
    gfx.lineBetween(x, y + h * 0.33, x + w, y + h * 0.33);
    gfx.lineBetween(x, y + h * 0.66, x + w, y + h * 0.66);
    // Border
    gfx.lineStyle(1, 0xccbbaa, 0.6);
    gfx.strokeRect(x, y, w, h);
  },
  drawPath: (gfx, waypoints) => {
    // Dashed fold line style
    gfx.lineStyle(3, 0xaa9988, 0.6);
    gfx.beginPath();
    gfx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      gfx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gfx.strokePath();
    // Fold dots along path
    for (let i = 0; i < waypoints.length; i++) {
      gfx.fillStyle(0x887766, 0.6);
      gfx.fillCircle(waypoints[i].x, waypoints[i].y, 3);
    }
  },
};

// ═══════════════════════════════════════════
// THEME 3: 스테인드글라스
// ═══════════════════════════════════════════
export const STAINEDGLASS_THEME: ThemeConfig = {
  id: 'stainedglass',
  name: 'Stained Glass',
  nameKo: '스테인드글라스',
  background: 0x1a1a2e,
  gridCellColor: 0x222244,
  gridCellAlpha: 0.6,
  gridLineColor: 0x111111,
  gridLineAlpha: 0.9,
  pathColor: 0x332244,
  pathAlpha: 0.6,
  pathLineColor: 0x111111,
  pathLineWidth: 4,
  hudBgColor: 0x111122,
  hudBgAlpha: 0.95,
  hudTextColor: '#eedd88',
  hudAccentColor: '#ff8844',
  panelBgColor: 0x111122,
  panelBgAlpha: 0.95,
  towerVisuals: {
    archer: { color: 0x22cc66, glowColor: 0x44ff88, shape: 'hexagon', outlineWidth: 3, outlineColor: 0x111111, alpha: 0.9 },
    cannon: { color: 0xcc2244, glowColor: 0xff4466, shape: 'hexagon', outlineWidth: 3, outlineColor: 0x111111, alpha: 0.9 },
    slow:   { color: 0x2266cc, glowColor: 0x4488ff, shape: 'hexagon', outlineWidth: 3, outlineColor: 0x111111, alpha: 0.9 },
  },
  enemyVisuals: {
    goblin: { color: 0xcc3344, shape: 'crystal', radius: 10, alpha: 0.9, outlineColor: 0x111111, outlineWidth: 3 },
    wolf:   { color: 0x9944cc, shape: 'crystal', radius: 10, alpha: 0.9, outlineColor: 0x111111, outlineWidth: 3 },
    troll:  { color: 0x888899, shape: 'crystal', radius: 16, alpha: 0.9, outlineColor: 0x111111, outlineWidth: 3 },
  },
  projectileColor: 0xffdd44,
  projectileGlow: 0xffaa22,
  mergeParticleColors: [0xffdd44, 0xff8844, 0xffffff],
  deathParticleColor: 0xffdd44,
  hitFlashColor: 0xffdd44,
  drawTower: (gfx, type, tier, size) => {
    const colors: Record<TowerType, number> = { archer: 0x22cc66, cannon: 0xcc2244, slow: 0x2266cc };
    const c = colors[type];
    const s = size;

    // Back glow (light through glass)
    gfx.fillStyle(c, 0.15);
    gfx.fillCircle(0, 0, s + 10);

    // Hexagonal stained glass shape with facets
    const sides = 6;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      points.push({ x: Math.cos(angle) * s, y: Math.sin(angle) * s });
    }

    // Fill hexagon
    gfx.fillStyle(c, 0.85);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < sides; i++) gfx.lineTo(points[i].x, points[i].y);
    gfx.closePath();
    gfx.fillPath();

    // Internal glass facets (leading lines from center)
    gfx.lineStyle(2, 0x111111, 0.8);
    for (let i = 0; i < sides; i++) {
      gfx.lineBetween(0, 0, points[i].x, points[i].y);
    }

    // Highlight facets (lighter triangles for top ones)
    gfx.fillStyle(c, 0.4);
    gfx.fillTriangle(0, 0, points[0].x, points[0].y, points[1].x, points[1].y);
    gfx.fillStyle(0xffffff, 0.15);
    gfx.fillTriangle(0, 0, points[5].x, points[5].y, points[0].x, points[0].y);

    // Heavy black outline (leading)
    gfx.lineStyle(3, 0x111111, 0.95);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < sides; i++) gfx.lineTo(points[i].x, points[i].y);
    gfx.closePath();
    gfx.strokePath();

    // Tier gems
    for (let i = 0; i < tier; i++) {
      const angle = ((i + 1) / (tier + 1)) * Math.PI - Math.PI / 2;
      const gx = Math.cos(angle) * s * 0.5;
      const gy = Math.sin(angle) * s * 0.5;
      gfx.fillStyle(0xffdd44, 0.9);
      gfx.fillCircle(gx, gy, 3);
      gfx.lineStyle(1, 0x111111, 0.8);
      gfx.strokeCircle(gx, gy, 3);
    }
  },
  drawEnemy: (gfx, type) => {
    const visuals = STAINEDGLASS_THEME.enemyVisuals[type];
    const r = visuals.radius;

    // Crystal/gem enemy shape
    if (type === 'wolf') {
      // Elongated diamond
      gfx.fillStyle(visuals.color, 0.85);
      gfx.fillTriangle(0, -r * 1.2, -r * 0.7, 0, 0, r * 1.2);
      gfx.fillTriangle(0, -r * 1.2, r * 0.7, 0, 0, r * 1.2);
      // Light facet
      gfx.fillStyle(0xffffff, 0.15);
      gfx.fillTriangle(0, -r * 1.2, -r * 0.7, 0, 0, 0);
      // Leading
      gfx.lineStyle(3, 0x111111, 0.9);
      gfx.beginPath();
      gfx.moveTo(0, -r * 1.2);
      gfx.lineTo(r * 0.7, 0);
      gfx.lineTo(0, r * 1.2);
      gfx.lineTo(-r * 0.7, 0);
      gfx.closePath();
      gfx.strokePath();
      gfx.lineBetween(0, -r * 1.2, 0, r * 1.2);
    } else if (type === 'troll') {
      // Large octagon
      const sides = 8;
      gfx.fillStyle(visuals.color, 0.8);
      gfx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      }
      gfx.closePath();
      gfx.fillPath();
      // Facets
      gfx.lineStyle(2, 0x111111, 0.7);
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        gfx.lineBetween(0, 0, Math.cos(angle) * r, Math.sin(angle) * r);
      }
      // Heavy outline
      gfx.lineStyle(3, 0x111111, 0.9);
      gfx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      }
      gfx.closePath();
      gfx.strokePath();
    } else {
      // Pentagon gem (goblin)
      const sides = 5;
      gfx.fillStyle(visuals.color, 0.85);
      gfx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      }
      gfx.closePath();
      gfx.fillPath();
      // Light
      gfx.fillStyle(0xffffff, 0.15);
      const a0 = -Math.PI / 2;
      const a1 = (1 / sides) * Math.PI * 2 - Math.PI / 2;
      gfx.fillTriangle(0, 0, Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r);
      // Leading
      gfx.lineStyle(3, 0x111111, 0.9);
      gfx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      }
      gfx.closePath();
      gfx.strokePath();
    }
  },
  drawGrid: (gfx, x, y, w, h, isPath) => {
    if (isPath) {
      gfx.fillStyle(0x332244, 0.6);
    } else {
      gfx.fillStyle(0x222244, 0.6);
    }
    gfx.fillRect(x, y, w, h);
    // Heavy black leading lines
    gfx.lineStyle(3, 0x111111, 0.9);
    gfx.strokeRect(x, y, w, h);
    // Inner facet hint
    gfx.lineStyle(1, 0x111111, 0.3);
    gfx.lineBetween(x, y, x + w, y + h);
  },
  drawPath: (gfx, waypoints) => {
    // Thick black leading lines
    gfx.lineStyle(6, 0x111111, 0.9);
    gfx.beginPath();
    gfx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      gfx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gfx.strokePath();
    // Inner colored glass line
    gfx.lineStyle(2, 0x664488, 0.5);
    gfx.beginPath();
    gfx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      gfx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    gfx.strokePath();
  },
};

// ═══════════════════════════════════════════
// Theme Manager
// ═══════════════════════════════════════════
const THEMES: Record<ThemeId, ThemeConfig> = {
  cell: CELL_THEME,
  origami: ORIGAMI_THEME,
  stainedglass: STAINEDGLASS_THEME,
};

let currentTheme: ThemeId = 'cell';

export function setTheme(id: ThemeId): void {
  currentTheme = id;
}

export function getTheme(): ThemeConfig {
  return THEMES[currentTheme];
}

export function getThemeId(): ThemeId {
  return currentTheme;
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}
