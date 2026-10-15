import { canvas, resize } from './canvas.js';
import { initInput } from './input.js';
import { G, startGame, update } from './game.js';
import { drawWorld } from './render.js';
import { drawHud, drawOverlay, drawCrosshair } from './hud.js';

window.addEventListener('resize', resize);
resize();
initInput(canvas, () => { if (G.state !== 'playing') startGame(); });

startGame();
G.state = 'menu';

function draw() {
  drawWorld();
  if (G.state === 'playing') drawHud();
  else if (G.state === 'menu') {
    drawOverlay('枪战小游戏', [
      'WASD 或 方向键 移动',
      '鼠标瞄准 · 按住左键射击',
      '击杀敌人得分，捡起绿色医疗包回血',
    ], '点击鼠标 或 按空格 开始');
  } else if (G.state === 'over') {
    drawHud();
    drawOverlay('游戏结束', [
      '本局得分：' + G.score + '（最高分 ' + G.best + '）',
      '存活到第 ' + G.wave + ' 波',
    ], '点击鼠标 或 按空格 重新开始');
  }
  drawCrosshair();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  if (G.state === 'playing') update(dt);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
