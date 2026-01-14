/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      satoshi: ['Satoshi', 'sans-serif'],
    },
    extend: {
      colors: {
        // 1. Semantic Colors (Change based on .theme-admin class)
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        highlight: 'var(--color-highlight)',

        // 2. Strict Black & White
        black: '#000000',
        white: '#ffffff',
        
        // 3. Batch 1 Direct Access (Student/Login)
        'b1-1': '#FFA5C0',
        'b1-2': '#FFB7A5',
        'b1-3': '#FFE4A5',
        'b1-4': '#A5FFE4',
        'b1-5': '#A5C0FF',
        'b1-6': '#A5FFB7',
        'b1-7': '#B7A5FF',

        // 4. Batch 5 Direct Access (Faculty/Admin)
        'b5-1': '#B9CEFF',
        'b5-2': '#C7B9FF',
        'b5-3': '#EAB9FF',
        'b5-4': '#FFEAB9',
        'b5-5': '#CEFFB9',
        'b5-6': '#FFC7B9',
        'b5-7': '#B9FFC7',
      },
    },
  },
  plugins: [],
}