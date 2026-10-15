export const COLORS = {
  bgTop: '#0a0f1e',
  bgBottom: '#161c33',
  player: '#4cc9f0',
  engine: '#7de3ff',
  bullet: '#ffd166',
  muzzle: '#ffd166',
  heal: '#6ee27a',
  hurt: '#ff6b6b',
  grunt: '#ef476f',
  fast: '#f78c6b',
  tank: '#c9184a',
};

export const PLAYER = { r: 14, hp: 100, speed: 270 };

export const GUN = {
  interval: 0.13,
  spread: 0.04,
  bulletSpeed: 560,
  bulletR: 4,
  muzzleOffset: 10,
};

export const PICKUP = { chance: 0.12, r: 10, heal: 25, life: 9 };

export const MAX_ENEMIES = 60;

export const killsNeeded = wave => 8 + wave * 4;
