import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          50: "#f0f4f9",
          100: "#dbe5f2",
          200: "#b8cce4",
          300: "#8baece",
          400: "#5d8eb8",
          500: "#3d71a1",
          600: "#2d5783",
          700: "#244569",
          800: "#1e3753",
          900: "#0f233a",
          primary: "#0f2b5c",
          accent: "#2563eb",
        },
        semantic: {
          paid: "#16a34a",
          partial: "#ea580c",
          unpaid: "#dc2626",
          info: "#0284c7",
          neutral: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
