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
        // Paleta inspirada en el logo oficial de acuarela (Cristales, Luna, Valle de Elqui)
        parchment: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F4ECE0',
          300: '#EBDDCB',
          400: '#E0CCB4',
          DEFAULT: '#FAF6F0'
        },
        emerald: {
          wash: '#4A6D56',
          dark: '#284232',
          light: '#E2ECE5',
          DEFAULT: '#3D5E49'
        },
        quartz: {
          rose: '#C78883',
          soft: '#E8C5C2',
          mist: '#F8EBEA',
          DEFAULT: '#C78883'
        },
        amethyst: {
          soft: '#9B7B8F',
          light: '#EFE7EC',
          DEFAULT: '#8C6D85'
        },
        terracotta: {
          warm: '#B66D4E',
          soft: '#E5A992',
          dark: '#8E4D34',
          DEFAULT: '#B66D4E'
        },
        gold: {
          luna: '#C5A059',
          wash: '#F0E0B4',
          deep: '#9B7830',
          DEFAULT: '#C5A059'
        },
        ink: {
          deep: '#26201B',
          medium: '#554B43',
          muted: '#85786E',
          DEFAULT: '#26201B'
        },
        // Compatibilidad con tokens previos
        sand: '#FAF6F0',
        clay: '#EBDDCB',
        forest: '#284232'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        script: ['"Alex Brush"', '"Great Vibes"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', '"Work Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px -5px rgba(70, 52, 38, 0.07)',
        watercolor: '0 12px 35px -6px rgba(182, 109, 78, 0.12), 0 4px 12px -2px rgba(61, 94, 73, 0.08)',
        glow: '0 0 25px rgba(197, 160, 89, 0.25)',
        'glow-emerald': '0 0 25px rgba(74, 109, 86, 0.22)'
      },
      backgroundImage: {
        'watercolor-wash': 'radial-gradient(ellipse at 10% 20%, rgba(226, 236, 229, 0.55) 0%, transparent 50%), radial-gradient(ellipse at 90% 15%, rgba(248, 235, 234, 0.6) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(240, 224, 180, 0.35) 0%, transparent 60%)',
        'watercolor-gradient': 'linear-gradient(135deg, #3D5E49 0%, #B66D4E 60%, #C5A059 100%)',
        'watercolor-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(250, 246, 240, 0.85) 100%)'
      }
    }
  },
  plugins: [typography]
};
