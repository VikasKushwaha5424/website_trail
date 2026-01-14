/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      satoshi: ['Satoshi', 'sans-serif'],
      // You can add 'poppins': ['Poppins', 'sans-serif'] here if you want a cuter font
    },
    extend: {
      colors: {
        // MAPPING TAILWIND TO YOUR CSS VARIABLES
        primary: 'var(--color-primary)',   // #B9CEFF
        secondary: 'var(--color-secondary)', // #C7B9FF
        accent: 'var(--color-accent)',       // #EAB9FF
        
        // Neutral Shades (Good for text)
        black: '#1C2434',
        'slate-900': '#0f172a',
        'slate-800': '#1e293b',
        'slate-700': '#334155',
        'slate-200': '#e2e8f0',
      },
    },
  },
  plugins: [],
}