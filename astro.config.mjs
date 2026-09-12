// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio de producción. Ajústalo al dominio real antes de publicar:
// se usa para `sitemap.xml`, las URLs canónicas y los `hreflang` alternativos.
const SITE = 'https://annakwines.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'sv'],
    routing: {
      // prefixDefaultLocale: false
      //   → el idioma por defecto (es) vive en la raíz: "/", "/#contact".
      //   → los demás idiomas van prefijados: "/en", "/sv".
      // Elegido para una landing de una sola página con España como mercado
      // principal: URLs limpias para el público objetivo y rutas explícitas,
      // cacheables e indexables para EN/SV — sin depender de detección por
      // navegador (que exigiría SSR/middleware).
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-ES', en: 'en', sv: 'sv-SE' },
      },
    }),
  ],
});
