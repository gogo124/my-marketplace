import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f6f1e8",
        ink: "#1f2937",
        clay: "#cc785c",
        forest: "#284b3f",
        gold: "#b88a44"
      },
      boxShadow: {
        card: "0 20px 40px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
