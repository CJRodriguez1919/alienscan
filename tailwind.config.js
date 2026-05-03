/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light palette — warm paper, deep ink, signal green
        paper: {
          50: "#fdfcf7",
          100: "#f8f5ec",
          200: "#efeadb",
        },
        ink: {
          900: "#1a1a1d",
          700: "#3a3a40",
          500: "#71717a",
        },
        signal: {
          // The "something detected" accent
          400: "#5fcf6f",
          500: "#34a853",
          600: "#1f7a3d",
        },
        amber: {
          warn: "#d97706",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter Tight'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
    },
  },
  plugins: [],
};
