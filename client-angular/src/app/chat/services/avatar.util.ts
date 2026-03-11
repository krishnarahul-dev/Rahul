/**
 * Deterministic color assignment based on a user's name.
 * Returns a hex color from a curated palette.
 */
const PALETTE = [
  '#3182fc', '#e74c8b', '#f59e0b', '#10b981',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316',
];

export function avatarColor(name: string = ''): string {
  let hash = 0;
  for (const ch of name) {
    hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string = ''): string {
  return name.charAt(0).toUpperCase();
}
