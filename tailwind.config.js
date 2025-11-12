/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de GasCaquetá con variantes pastel
        'gc-blue': {
          DEFAULT: '#262A73',    // Azul principal
          50: '#E8E9F5',         // Pastel muy claro
          100: '#D1D3EB',        // Pastel claro
          500: '#262A73',        // Original
          600: '#1E2159',        // Oscuro
        },
        'gc-green': {
          DEFAULT: '#86BF30',    // Verde principal
          50: '#F0F7E6',         // Pastel muy claro
          100: '#E1EFCC',        // Pastel claro
          500: '#86BF30',        // Original
          600: '#6A9926',        // Oscuro
        },
        'gc-lime': {
          DEFAULT: '#B4D930',    // Verde lima
          50: '#F6FAEB',         // Pastel muy claro
          100: '#EDF5D7',        // Pastel claro
          500: '#B4D930',        // Original
          600: '#90AE26',        // Oscuro
        },
        'gc-orange': {
          DEFAULT: '#F2622E',    // Naranja principal
          50: '#FEF0EB',         // Pastel muy claro
          100: '#FDE1D7',        // Pastel claro
          500: '#F2622E',        // Original
          600: '#C24E25',        // Oscuro
        },
      },
    },
  },
  plugins: [],
}

