// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Active le mode sombre via la classe "dark"
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#d6e4ff',
          200: '#adc8ff',
          300: '#85a9ff',
          400: '#6690ff',
          500: '#3366ff', // <- c’est ici que text-primary-500 pointe
          600: '#254eda',
          700: '#1939b7',
          800: '#102693',
          900: '#091a7a',
        },
        secondary: '#21BF31',      // Vert
        background: {
          dark: '#2B2D42',         // Fond sombre
          light: '#EDF2F4',        // Fond clair
        },
        graycustom: '#8D99AE',     // Gris bleu pour textes ou bordures
      },
      width: {
        '22': '5.5rem',             // 288px
      },
      fontSize: {
        "2xs": ['0.825rem', { lineHeight: '0.775rem' }],
        "3xs": ['0.763rem', { lineHeight: '0.65rem' }],
        "4xs": ['0.663rem', { lineHeight: '0.55rem' }],
        "5xs": ['0.563rem', { lineHeight: '0.45rem' }],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite', // Plus lent
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}