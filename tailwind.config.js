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
        // Museum Mode (Light Theme)
        museum: {
          bg: '#F5F1E8',
          surface: '#FFFFFF',
          text: '#111111',
          primary: '#0057FF',
          secondary: '#FF6B00',
        },
        // Darkroom Mode (Dark Theme)
        darkroom: {
          bg: '#0F0F10',
          surface: '#18181B',
          text: '#FAFAFA',
          accent: '#EAB308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
