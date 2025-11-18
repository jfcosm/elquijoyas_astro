import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Configuración principal del proyecto Astro
export default defineConfig({
  site: 'https://www.elquijoyas.cl', // Ajusta esta URL cuando publiques en GitHub Pages
  base: '/',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static'
});
