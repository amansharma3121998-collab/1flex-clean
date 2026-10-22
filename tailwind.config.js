/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e50914',
          darkRed: '#b80710',
        },
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['"Geist Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
