/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FBEAEC',
          100: '#F3CCD2',
          400: '#9C3349',
          500: '#7E1A33',
          600: '#6E1029', // primary brand maroon (sidebar accent, buttons)
          700: '#5C0E22',
          800: '#4A0B1B',
        },
        ink: {
          900: '#1C1A19', // primary heading/body text
          700: '#3D3935',
          500: '#6B6560',
          400: '#8C8680',
          300: '#A8A29C',
        },
        hairline: '#E6E2DD',
        surface: {
          DEFAULT: '#FFFFFF',
          sidebar: '#FAFAF8',
          subtle: '#F6F4F1',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        widest2: '0.14em',
      },
    },
  },
  plugins: [],
};
