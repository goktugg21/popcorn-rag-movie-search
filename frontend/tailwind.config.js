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
        'primary': {
          light: '#3B82F6', // blue-500
          dark: '#2563EB', // blue-600
        },
        'secondary': {
          light: '#6B7280', // gray-500
          dark: '#4B5563', // gray-600
        },
        'background': {
          light: '#F9FAFB', // gray-50
          dark: '#1F2937', // gray-800
        },
        'surface': {
          light: '#FFFFFF', // white
          dark: '#111827', // gray-900
        }
      },
    },
  },
  plugins: [],
}
