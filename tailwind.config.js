/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 40px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        brand: {
          50: '#eefaf7',
          100: '#d7f4eb',
          300: '#7ad7be',
          500: '#18a57c',
          700: '#0f7f63',
        },
      },
    },
  },
  plugins: [],
};
