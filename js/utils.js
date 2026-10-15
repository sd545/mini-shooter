export const TAU = Math.PI * 2;

export const rand = (a, b) => a + Math.random() * (b - a);

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
