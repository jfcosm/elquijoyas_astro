# Elqui Joyas - Sitio estático con Astro

Sitio web estático para la joyería artesanal **Elqui Joyas**, creado con **Astro**, **Tailwind CSS** y componentes de **React** para las interacciones (botones flotantes).

## Requisitos

- Node.js 18+
- npm

## Scripts

- `npm run dev`: servidor de desarrollo.
- `npm run build`: genera la versión estática lista para GitHub Pages.
- `npm run preview`: sirve el build para revisión local.
- `npm run check`: validación estática de Astro/TypeScript.

## Notas rápidas de contenido

- Edita los textos principales en `src/components/*.astro`.
- Actualiza los datos de las joyas en `src/data/jewels.ts` y reemplaza las imágenes en `public/images/jewels/`.
- Cambia el número de WhatsApp y URL de Instagram en `Header.astro`, `ContactSection.astro` y los botones flotantes `.tsx`.

## Despliegue en GitHub Pages

1. Ejecuta `npm install`.
2. Construye el sitio con `npm run build`.
3. Publica la carpeta `dist/` en tu rama o flujo de GitHub Pages.
4. Actualiza `site` en `astro.config.mjs` con la URL final del sitio.
