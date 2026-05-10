/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4edea3",
        "on-primary": "#003824",
        "background": "#0b1326",
        "surface": "#0b1326",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#bbcabf",
        "primary-container": "#10b981",
        "on-primary-container": "#00422b",
        "secondary": "#95d3ba",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "outline": "#86948a",
      },
      fontFamily: {
        display: ["Be Vietnam Pro", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
        spline: ["Spline Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
