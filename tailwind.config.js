/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C47A',
          dark:    '#9B7A2E',
          muted:   '#7A5E20',
          subtle:  '#2A2310',
        },
        bg: {
          app:     '#0f0f0f',
          surface: '#171717',
          card:    '#1e1e1e',
          card2:   '#252525',
        },
        text: {
          primary:   '#F0E6CC',
          secondary: '#A89060',
          muted:     '#5A4828',
          faint:     '#3A2A10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        gold: {
          DEFAULT: 'rgba(201,168,76,0.22)',
          strong:  'rgba(201,168,76,0.45)',
          subtle:  'rgba(201,168,76,0.10)',
        },
      },
    },
  },
  plugins: [],
}
