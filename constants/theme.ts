export const colors = {
  bg: {
    primary: "#0A0B0F",
    card: "#1A1B25",
    elevated: "#252636",
    overlay: "rgba(10,11,15,0.92)",
  },
  brand: {
    blue: "#2563EB",
    blueLight: "#3B82F6",
    blueDark: "#1D4ED8",
    gold: "#FACC15",
    goldDark: "#EAB308",
  },
  accent: {
    green: "#10B981",
    red: "#EF4444",
    orange: "#F97316",
    purple: "#8B5CF6",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#9CA3AF",
    muted: "#4B5563",
  },
  border: {
    default: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.15)",
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
