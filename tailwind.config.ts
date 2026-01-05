import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // daisyUI best practice
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6",
        "primary-light": "#a78bfa",
        "primary-dark": "#7c3aed",

        secondary: "#f8fafc",
        "secondary-dark": "#334155",

        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      maxWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
      },
    },
  },

  /* ✅ IMPORTANT FIX */
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"), // <-- THIS WAS MISSING
  ],

  daisyui: {
    themes: ["synthwave"],
  },
} satisfies Config;
