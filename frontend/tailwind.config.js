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
          DEFAULT: '#3B82F6',
          light: '#3B82F6', // blue-500
          dark: '#2563EB', // blue-600
        },
        'secondary': {
          DEFAULT: '#6B7280',
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
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out'
      }
    },
  },
  plugins: [],
}
