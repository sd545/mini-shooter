import { ctx, view } from './canvas.js';
import { G } from './game.js';
import { TAU, rand, clamp, roundRect } from './utils.js';
import { COLORS } from './config.js';

const FONT = '"Segoe UI", sans-serif';

const STAR_LAYERS = [
  { n: 70, speed: 6, size: 1, alpha: 0.3 },
  { n: 45, speed: 15, size: 1.6, alpha: 0.55 },
  { n: 25, speed: 28, size: 2.2, alpha: 0.8 },
];
const stars = [];
for (let li = 0; li < STAR_LAYERS.length; li++) {
  for (let i = 0; i < STAR_LAYERS[li].n; i++) {
    stars.push({ nx: Math.random(), ny: Math.random(), layer: li, tw: rand(0, TAU) });
  }
}

function drawBackground(t, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, COLORS.bgTop);
  g.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.fillStyle = '#cfe4ff';
  const span = w + 60;
  for (const s of stars) {
    const L = STAR_LAYERS[s.layer];
    const x = (s.nx * span + t * L.speed) % span - 30;
    ctx.globalAlpha = L.alpha * (0.7 + 0.3 * Math.sin(t * 2 + s.tw));
    ctx.beginPath();
    ctx.arc(x, s.ny * h, L.size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrid(t, w, h) {
  ctx.strokeStyle = 'rgba(130,170,255,' + (0.035 + 0.015 * Math.sin(t * 0.8)) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 48) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += 48) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

function drawVignette(w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawPickups(t) {
  for (const p of G.pickups) {
    if (p.life < 3 && Math.floor(p.life * 6) % 2 === 0) continue;
    const pulse = 1 + 0.18 * Math.sin(t * 5 + p.pulse);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5 + p.pulse);
    ctx.fillStyle = COLORS.heal;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.r + 6) * pulse, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.shadowColor = COLORS.heal;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#2b8a3e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * pulse, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(p.x - 2 * pulse, p.y - 6 * pulse, 4 * pulse, 12 * pulse);
    ctx.fillRect(p.x - 6 * pulse, p.y - 2 * pulse, 12 * pulse, 4 * pulse);
  }
}

function drawBullets() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of G.bullets) {
    for (let i = 0; i < b.trail.length; i++) {
      const tp = b.trail[i];
      const k = (i + 1) / b.trail.length;
      ctx.globalAlpha = k * 0.35;
      ctx.fillStyle = COLORS.bullet;
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, b.r * k, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = COLORS.bullet;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function enemyPath(e) {
  const r = e.r;
  ctx.beginPath();
  if (e.type === 'fast') {
    ctx.moveTo(r * 1.25, 0);
    ctx.lineTo(-r * 0.85, r * 0.85);
    ctx.lineTo(-r * 0.45, 0);
    ctx.lineTo(-r * 0.85, -r * 0.85);
  } else if (e.type === 'tank') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      if (i) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else {
    ctx.moveTo(r, 0);
    ctx.lineTo(0, r * 0.78);
    ctx.lineTo(-r, 0);
    ctx.lineTo(0, -r * 0.78);
  }
  ctx.closePath();
}

function drawEnemies() {
  for (const e of G.enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.shadowColor = e.color;
    ctx.shadowBlur = e.type === 'tank' ? 18 : 12;
    ctx.fillStyle = e.color;
    enemyPath(e);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = e.type === 'tank' ? 4 : 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.4, 0, TAU);
    ctx.fill();
    if (e.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (e.flash / 0.09) * 0.8 + ')';
      enemyPath(e);
      ctx.fill();
    }
    ctx.restore();
    if (e.hp < e.maxHp) {
      const w = e.r * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, e.x - e.r, e.y - e.r - 9, w, 4, 2);
      ctx.fill();
      ctx.fillStyle = COLORS.heal;
      roundRect(ctx, e.x - e.r, e.y - e.r - 9, Math.max(2, w * (e.hp / e.maxHp)), 4, 2);
      ctx.fill();
    }
  }
}

function drawPlayer() {
  const p = G.player;
  const blink = p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0;
  if (blink) return;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#dee2e6';
  roundRect(ctx, p.r - 2, -3, 18, 6, 3);
  ctx.fill();
  if (p.muzzle > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = p.muzzle / 0.05;
    ctx.shadowColor = COLORS.muzzle;
    ctx.shadowBlur = 18;
    ctx.fillStyle = COLORS.muzzle;
    ctx.beginPath();
    ctx.arc(p.r + 16, 0, 6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  const g = ctx.createRadialGradient(p.x - 4, p.y - 4, 2, p.x, p.y, p.r);
  g.addColorStop(0, '#bfefff');
  g.addColorStop(1, COLORS.player);
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 18;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of G.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawTexts() {
  ctx.save();
  ctx.textAlign = 'center';
  for (const t of G.texts) {
    ctx.globalAlpha = clamp(t.life, 0, 1);
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = t.color;
    ctx.font = 'bold ' + t.size + 'px ' + FONT;
    ctx.fillText(t.str, t.x, t.y);
  }
  ctx.restore();
}

export function drawWorld() {
  const { w, h } = view;
  const t = performance.now() / 1000;
  drawBackground(t, w, h);
  drawGrid(t, w, h);

  ctx.save();
  if (G.shake > 0) {
    const s = G.shake;
    ctx.translate(
      Math.sin(t * 67) * s + rand(-1, 1) * s * 0.25,
      Math.cos(t * 83) * s + rand(-1, 1) * s * 0.25
    );
  }

  drawPickups(t);
  drawBullets();
  drawEnemies();
  if (G.state !== 'over') drawPlayer();
  drawParticles();
  drawTexts();

  ctx.restore();
  drawVignette(w, h);
}
