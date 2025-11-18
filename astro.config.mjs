import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Configuración principal del proyecto Astro
// Ajusta la propiedad `site` con la URL pública de GitHub Pages
// y `base` con el nombre del repositorio si se despliega desde /<user>.github.io/<repo>/
export default defineConfig({
  site: 'https://elquijoyas.github.io/elquijoyas_astro/',
  base: '/elquijoyas_astro',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static'
});
