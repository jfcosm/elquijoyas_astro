import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Configuración principal del proyecto Astro
export default defineConfig({
  site: 'https://jfcosm.github.io/elquijoyas_astro/', // Ajusta esta URL cuando publiques en GitHub Pages
  base: '/elquijoyas_astro/',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static'
});
