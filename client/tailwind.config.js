/** @type {import('tailwindcss').Config} */

//en esta parte se configura tailwind para que escanee los archivos donde se usan las clases de tailwind, y se extiende el tema para agregar colores personalizados y fuentes personalizadas
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {

        accent: {
          300: '#fca5a5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}