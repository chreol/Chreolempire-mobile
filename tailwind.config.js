/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Chreol Empire Design System
        bg: {
          primary: "#0A0B0F",
          card: "#1A1B25",
          elevated: "#252636",
          overlay: "rgba(10,11,15,0.9)",
        },
        brand: {
          blue: "#2563EB",
          "blue-light": "#3B82F6",
          "blue-dark": "#1D4ED8",
          gold: "#FACC15",
          "gold-dark": "#EAB308",
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
          inverse: "#0A0B0F",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.15)",
        },
      },
      fontFamily: {
        sans: ["Inter-Regular"],
        "sans-medium": ["Inter-Medium"],
        "sans-semibold": ["Inter-SemiBold"],
        "sans-bold": ["Inter-Bold"],
        "sans-extrabold": ["Inter-ExtraBold"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
