import { rand, TAU } from './utils.js';

export function spawnParticle(arr, x, y, color, size, life, speed) {
  const a = rand(0, TAU);
  const v = rand(speed * 0.3, speed);
  arr.push({
    x, y,
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v,
    life, maxLife: life,
    color,
    size: rand(size * 0.6, size * 1.4),
  });
}

export function explode(arr, x, y, color, n, size) {
  for (let i = 0; i < n; i++) spawnParticle(arr, x, y, color, size, rand(0.25, 0.6), 260);
}

export function addText(arr, x, y, str, life, color, size) {
  arr.push({ x, y, str, life, color, size });
}

export function updateParticles(arr, dt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const p = arr[i];
    p.life -= dt;
    if (p.life <= 0) {
      arr.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
  }
}

export function updateTexts(arr, dt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const t = arr[i];
    t.life -= dt;
    t.y -= 30 * dt;
    if (t.life <= 0) arr.splice(i, 1);
  }
}
