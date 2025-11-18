import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        sand: '#f8f3ed',
        gold: '#c6a067',
        clay: '#e6d3c0',
        forest: '#2f5c48',
        terracotta: '#d9876b'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 40px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: [typography]
};
