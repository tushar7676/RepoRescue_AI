import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0B0F19",
          900: "#111827",
          850: "#161F33",
          800: "#1F293D",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
        }
      },
      backgroundImage: {
        "radial-gradient": "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      }
    },
  },
  plugins: [],
};
export default config;
