const PALETTE = [
  '#3182fc', '#e74c8b', '#f59e0b', '#10b981',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316',
];

export function avatarColor(name: string = ''): string {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function initials(name: string = ''): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}
