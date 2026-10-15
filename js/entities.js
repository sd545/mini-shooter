import { COLORS, PLAYER, GUN, PICKUP } from './config.js';
import { rand, TAU } from './utils.js';

export function createPlayer(w, h) {
  return {
    x: w / 2, y: h / 2,
    r: PLAYER.r, hp: PLAYER.hp, maxHp: PLAYER.hp, speed: PLAYER.speed,
    angle: 0, invuln: 0, engine: 0, muzzle: 0,
  };
}

export function createEnemy(x, y, wave) {
  const roll = Math.random();
  let e;
  if (wave >= 3 && roll < 0.15) {
    e = { type: 'tank', r: 26, hp: 8 + wave * 2, speed: 52 + wave * 2, color: COLORS.tank, dmg: 20, score: 30 };
  } else if (wave >= 2 && roll < 0.45) {
    e = { type: 'fast', r: 11, hp: 2, speed: 165 + wave * 5, color: COLORS.fast, dmg: 8, score: 15 };
  } else {
    e = { type: 'grunt', r: 16, hp: 3 + Math.floor(wave / 2), speed: 92 + wave * 4, color: COLORS.grunt, dmg: 12, score: 10 };
  }
  e.x = x;
  e.y = y;
  e.maxHp = e.hp;
  e.flash = 0;
  e.angle = 0;
  return e;
}

export function createBullet(x, y, angle) {
  return {
    x, y,
    vx: Math.cos(angle) * GUN.bulletSpeed,
    vy: Math.sin(angle) * GUN.bulletSpeed,
    r: GUN.bulletR,
    trail: [],
  };
}

export function createPickup(x, y) {
  return { x, y, r: PICKUP.r, heal: PICKUP.heal, life: PICKUP.life, pulse: rand(0, TAU) };
}
