export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

export const view = { w: 0, h: 0 };

export function resize() {
  view.w = canvas.width = window.innerWidth;
  view.h = canvas.height = window.innerHeight;
}
