import { view } from './canvas.js';
import { keys, mouse } from './input.js';
import { rand, clamp } from './utils.js';
import { COLORS, GUN, PICKUP, MAX_ENEMIES, killsNeeded } from './config.js';
import { createPlayer, createEnemy, createBullet, createPickup } from './entities.js';
import { spawnParticle, explode, addText, updateParticles, updateTexts } from './particles.js';

export const G = {
  state: 'menu',
  player: null,
  bullets: [],
  enemies: [],
  particles: [],
  pickups: [],
  texts: [],
  score: 0,
  wave: 1,
  waveKills: 0,
  spawnTimer: 0,
  fireTimer: 0,
  shake: 0,
  time: 0,
  best: Number(localStorage.getItem('mini-shooter-best') || 0),
};

export function startGame() {
  G.state = 'playing';
  G.player = createPlayer(view.w, view.h);
  G.bullets = [];
  G.enemies = [];
  G.particles = [];
  G.pickups = [];
  G.texts = [];
  G.score = 0;
  G.wave = 1;
  G.waveKills = 0;
  G.spawnTimer = 0.6;
  G.fireTimer = 0;
  G.shake = 0;
  G.time = 0;
}

function spawnEnemy() {
  const edge = Math.floor(rand(0, 4));
  let x, y;
  if (edge === 0) { x = rand(0, view.w); y = -30; }
  else if (edge === 1) { x = view.w + 30; y = rand(0, view.h); }
  else if (edge === 2) { x = rand(0, view.w); y = view.h + 30; }
  else { x = -30; y = rand(0, view.h); }
  G.enemies.push(createEnemy(x, y, G.wave));
}

function killEnemy(idx) {
  const e = G.enemies[idx];
  G.enemies.splice(idx, 1);
  G.score += e.score;
  G.waveKills++;
  explode(G.particles, e.x, e.y, e.color, 14, 3);
  addText(G.texts, e.x, e.y - 12, '+' + e.score, 0.7, '#ffffff', 15);
  if (Math.random() < PICKUP.chance) {
    G.pickups.push(createPickup(e.x, e.y));
  }
}

function gameOver() {
  G.state = 'over';
  mouse.down = false;
  explode(G.particles, G.player.x, G.player.y, COLORS.player, 40, 4);
  G.shake = 18;
  if (G.score > G.best) {
    G.best = G.score;
    localStorage.setItem('mini-shooter-best', String(G.best));
  }
}

export function update(dt) {
  G.time += dt;
  const p = G.player;

  const mx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
  const my = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
  if (mx || my) {
    const len = Math.hypot(mx, my);
    p.x += (mx / len) * p.speed * dt;
    p.y += (my / len) * p.speed * dt;
    p.engine -= dt;
    if (p.engine <= 0) {
      p.engine = 0.04;
      const ma = Math.atan2(my, mx);
      spawnParticle(G.particles, p.x - Math.cos(ma) * p.r, p.y - Math.sin(ma) * p.r, COLORS.engine, 2, 0.3, 90);
    }
  }
  p.x = clamp(p.x, p.r, view.w - p.r);
  p.y = clamp(p.y, p.r, view.h - p.r);
  p.angle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
  p.invuln = Math.max(0, p.invuln - dt);
  p.muzzle = Math.max(0, p.muzzle - dt);

  G.fireTimer -= dt;
  if (mouse.down && G.fireTimer <= 0) {
    G.fireTimer = GUN.interval;
    const a = p.angle + rand(-GUN.spread, GUN.spread);
    const bx = p.x + Math.cos(p.angle) * (p.r + GUN.muzzleOffset);
    const by = p.y + Math.sin(p.angle) * (p.r + GUN.muzzleOffset);
    G.bullets.push(createBullet(bx, by, a));
    for (let i = 0; i < 3; i++) spawnParticle(G.particles, bx, by, COLORS.muzzle, 1.6, 0.1, 140);
    p.muzzle = 0.05;
    G.shake = Math.min(G.shake + 0.5, 5);
  }

  G.spawnTimer -= dt;
  if (G.spawnTimer <= 0 && G.enemies.length < MAX_ENEMIES) {
    G.spawnTimer = Math.max(0.25, 1.4 - G.wave * 0.12 - G.time * 0.004);
    spawnEnemy();
  }

  for (const e of G.enemies) {
    const a = Math.atan2(p.y - e.y, p.x - e.x);
    e.angle = a;
    e.x += Math.cos(a) * e.speed * dt;
    e.y += Math.sin(a) * e.speed * dt;
    e.flash = Math.max(0, e.flash - dt);
  }
  for (let i = 0; i < G.enemies.length; i++) {
    for (let j = i + 1; j < G.enemies.length; j++) {
      const a = G.enemies[i], b = G.enemies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const min = a.r + b.r;
      if (d < min) {
        const push = (min - d) / 2;
        const nx = dx / d, ny = dy / d;
        a.x -= nx * push; a.y -= ny * push;
        b.x += nx * push; b.y += ny * push;
      }
    }
  }

  for (let i = G.bullets.length - 1; i >= 0; i--) {
    const b = G.bullets[i];
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 6) b.trail.shift();
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < -20 || b.x > view.w + 20 || b.y < -20 || b.y > view.h + 20) {
      G.bullets.splice(i, 1);
      continue;
    }
    for (let j = G.enemies.length - 1; j >= 0; j--) {
      const e = G.enemies[j];
      const rr = b.r + e.r;
      const dx = b.x - e.x, dy = b.y - e.y;
      if (dx * dx + dy * dy < rr * rr) {
        G.bullets.splice(i, 1);
        e.hp -= 1;
        e.flash = 0.09;
        e.x += b.vx * 0.004;
        e.y += b.vy * 0.004;
        explode(G.particles, b.x, b.y, COLORS.bullet, 3, 1.5);
        if (e.hp <= 0) killEnemy(j);
        break;
      }
    }
  }

  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    const rr = e.r + p.r;
    const dx = e.x - p.x, dy = e.y - p.y;
    if (dx * dx + dy * dy < rr * rr && p.invuln <= 0) {
      p.hp -= e.dmg;
      p.invuln = 0.6;
      G.shake = 12;
      explode(G.particles, p.x, p.y, COLORS.hurt, 12, 3);
      const d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * 30;
      e.y += (dy / d) * 30;
      if (p.hp <= 0) {
        gameOver();
        return;
      }
    }
  }

  for (let i = G.pickups.length - 1; i >= 0; i--) {
    const pk = G.pickups[i];
    pk.life -= dt;
    if (pk.life <= 0) {
      G.pickups.splice(i, 1);
      continue;
    }
    const rr = pk.r + p.r + 4;
    const dx = pk.x - p.x, dy = pk.y - p.y;
    if (dx * dx + dy * dy < rr * rr) {
      G.pickups.splice(i, 1);
      p.hp = Math.min(p.maxHp, p.hp + pk.heal);
      addText(G.texts, p.x, p.y - 22, '+' + pk.heal + ' HP', 0.8, COLORS.heal, 16);
      explode(G.particles, pk.x, pk.y, COLORS.heal, 10, 2);
    }
  }

  updateParticles(G.particles, dt);
  updateTexts(G.texts, dt);

  if (G.waveKills >= killsNeeded(G.wave)) {
    G.wave++;
    G.waveKills = 0;
    addText(G.texts, view.w / 2, view.h / 2 - 80, '第 ' + G.wave + ' 波', 1.8, COLORS.bullet, 44);
  }

  G.shake = Math.max(0, G.shake - dt * 22);
}
