import { view } from './canvas.js';

export const keys = Object.create(null);
export const mouse = { x: 0, y: 0, down: false };

export function initInput(canvas, onStart) {
  mouse.x = view.w / 2;
  mouse.y = view.h / 2;

  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (k === ' ' || k === 'enter') onStart();
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    mouse.down = false;
  });

  canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener('mousedown', () => {
    mouse.down = true;
    onStart();
  });
  window.addEventListener('mouseup', () => { mouse.down = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}
