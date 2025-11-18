import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Configuración principal del proyecto Astro
// Ajusta la propiedad `site` con la URL pública de GitHub Pages
// y `base` con el nombre del repositorio si se despliega desde /<user>.github.io/<repo>/
const site = process.env.ASTRO_SITE || 'https://elquijoyas.github.io/elquijoyas_astro';
const base = process.env.ASTRO_BASE || '/elquijoyas_astro/';

export default defineConfig({
  site,
  base,
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static'
});
