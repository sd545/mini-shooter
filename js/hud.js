import { ctx, view } from './canvas.js';
import { G } from './game.js';
import { mouse } from './input.js';
import { TAU, clamp, roundRect } from './utils.js';
import { COLORS, killsNeeded } from './config.js';

const FONT = '"Segoe UI", sans-serif';

export function drawHud() {
  const { w } = view;
  const p = G.player;
  const ratio = clamp(p.hp / p.maxHp, 0, 1);
  const col = ratio > 0.5 ? '#6ee27a' : ratio > 0.25 ? '#f0c05e' : '#e05656';

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, 16, 16, 224, 22, 11);
  ctx.fill();
  if (ratio > 0) {
    const bw = Math.max(9, 220 * ratio);
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.fillStyle = col;
    roundRect(ctx, 18, 18, bw, 18, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    const gloss = ctx.createLinearGradient(0, 18, 0, 36);
    gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    gloss.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = gloss;
    roundRect(ctx, 18, 18, bw, 18, 9);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, 16, 16, 224, 22, 11);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px ' + FONT;
  ctx.textAlign = 'left';
  ctx.fillText('HP ' + Math.max(0, Math.ceil(p.hp)), 24, 32);

  ctx.textAlign = 'center';
  ctx.font = 'bold 18px ' + FONT;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText('第 ' + G.wave + ' 波', w / 2, 32);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, w / 2 - 80, 41, 160, 5, 2.5);
  ctx.fill();
  const progress = clamp(G.waveKills / killsNeeded(G.wave), 0, 1);
  if (progress > 0) {
    ctx.shadowColor = COLORS.bullet;
    ctx.shadowBlur = 6;
    ctx.fillStyle = COLORS.bullet;
    roundRect(ctx, w / 2 - 80, 41, Math.max(5, 160 * progress), 5, 2.5);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'right';
  ctx.font = 'bold 20px ' + FONT;
  ctx.shadowColor = COLORS.bullet;
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLORS.bullet;
  ctx.fillText('得分 ' + G.score, w - 20, 32);
  ctx.shadowBlur = 0;
  ctx.font = '14px ' + FONT;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('最高 ' + G.best, w - 20, 54);
}

export function drawOverlay(title, lines, hint) {
  const { w, h } = view;
  ctx.fillStyle = 'rgba(8,10,16,0.72)';
  ctx.fillRect(0, 0, w, h);
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(120,200,255,0.8)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px ' + FONT;
  ctx.fillText(title, w / 2, h / 2 - 80);
  ctx.shadowBlur = 0;
  ctx.font = '18px ' + FONT;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  lines.forEach((line, i) => ctx.fillText(line, w / 2, h / 2 - 20 + i * 30));

  const breathe = 0.55 + 0.45 * Math.sin(performance.now() / 280);
  ctx.globalAlpha = breathe;
  ctx.shadowColor = COLORS.bullet;
  ctx.shadowBlur = 12;
  ctx.fillStyle = COLORS.bullet;
  ctx.font = 'bold 20px ' + FONT;
  ctx.fillText(hint, w / 2, h / 2 + 90);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawCrosshair() {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, TAU);
  ctx.stroke();
  ctx.rotate(t * 1.4);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU;
    ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.lineTo(Math.cos(a) * 5, Math.sin(a) * 5);
  }
  ctx.stroke();
  ctx.restore();
}
