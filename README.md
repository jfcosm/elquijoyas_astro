# Elqui Joyas - Sitio estático con Astro

Sitio web estático para la joyería artesanal **Elqui Joyas**, creado con **Astro**, **Tailwind CSS** y componentes de **React**
para las interacciones (botones flotantes).

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

1. Instala dependencias con `npm ci` (usa el `package-lock.json` incluido para builds reproducibles).
2. Construye el sitio con `npm run build`.
3. Si el sitio vive bajo `https://<usuario>.github.io/<repo>/`, ajusta en `astro.config.mjs` las propiedades:
   - `site: "https://<usuario>.github.io/<repo>/"`
   - `base: "/<repo>"`
4. El workflow `deploy.yml` ya prepara Pages con `actions/configure-pages`, cachea npm y publica automáticamente la carpeta `dist/`.
