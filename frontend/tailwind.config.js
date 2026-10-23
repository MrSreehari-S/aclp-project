/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      colors: {
        dark: {
          950: "#070A12",
          900: "#0B0F19",
          850: "#0F1626",
          800: "#141D30",
          750: "#1A253D",
          700: "#22304D",
          600: "#314366",
        },
        brand: {
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          pink: "#EC4899",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        "glass-lg": "0 16px 48px 0 rgba(0, 0, 0, 0.55)",
        "glow-purple": "0 0 30px -5px rgba(139, 92, 246, 0.4)",
        "glow-cyan": "0 0 30px -5px rgba(6, 182, 212, 0.4)",
        "glow-emerald": "0 0 30px -5px rgba(16, 185, 129, 0.4)",
        "glow-rose": "0 0 30px -5px rgba(244, 63, 94, 0.4)",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -45px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 25px) scale(0.92)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { opacity: "0.4", transform: "scale(0.98)" },
          "100%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        spinReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        blob: "blob 8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "spin-slow": "spin 14s linear infinite",
        "spin-reverse": "spinReverse 12s linear infinite",
        shimmer: "shimmer 2.5s infinite linear",
      },
    },
  },
  plugins: [],
};

