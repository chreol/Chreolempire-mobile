export const colors = {
  bg: {
    primary: "#0A0A0A",
    secondary: "#141414",
    card: "#181818",
    elevated: "#222222",
    overlay: "rgba(0,0,0,0.5)",
  },
  brand: {
    gold: "#C9A84C",
    goldLight: "#2A2210",
    goldDark: "#E8C96A",
    black: "#0A0A0A",
    white: "#FFFFFF",
    // kept for backward compat
    blue: "#C9A84C",
    blueLight: "#2A2210",
    blueDark: "#E8C96A",
  },
  accent: {
    green: "#25D366",
    red: "#E50914",
    blue: "#3B82F6",
    orange: "#FF6B00",
    yellow: "#FACC15",
    crypto: "#26A17B",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#A0A0A0",
    muted: "#555555",
    inverse: "#0A0A0A",
  },
  border: {
    default: "#2A2A2A",
    strong: "#3D3520",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

export const typography = {
  xs: { fontSize: 11, lineHeight: 16 },
  sm: { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  lg: { fontSize: 17, lineHeight: 24 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 30, lineHeight: 38 },
} as const;
