/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#B9CEFF',   // Color 1: Soft Blue
          secondary: '#C7B9FF', // Color 2: Soft Violet
          accent: '#EAB9FF',    // Color 3: Soft Orchid
          dark: '#4A5568',      // Text color for contrast against light backgrounds
        }
      }
    },
  },
  plugins: [],
}