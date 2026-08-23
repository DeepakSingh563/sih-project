/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueBg: '#e8f0fe',
          green: '#1e8e3e',
          greenHover: '#137333',
          greenBg: '#e6f4ea',
          yellow: '#f9ab00',
          yellowBg: '#fef7e0',
          red: '#d93025',
          redHover: '#b3261e',
          redBg: '#fce8e6',
          grey: '#5f6368',
          lightGrey: '#f1f3f4',
          border: '#dadce0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'google': '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'google-sm': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'google-lg': '0 4px 12px rgba(60,64,67,0.25), 0 8px 24px rgba(60,64,67,0.15)',
      },
    },
  },
  plugins: [],
}
