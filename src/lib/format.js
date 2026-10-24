export const formatPrice = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Deterministic uid for SVG gradient names. */
let uidCounter = 0;
export const nextUid = (prefix = 'u') => {
  uidCounter += 1;
  return `${prefix}${uidCounter}`;
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — non-fatal */
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
