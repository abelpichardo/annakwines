/**
 * Mapa de rutas del sitio.
 *
 * Cada página tiene una clave estable (`export`, `tastings`…) y un slug
 * distinto por idioma, para que las URLs sean naturales en ambos:
 * `/exportacion` y `/en/export`. La clave es lo que usan el enrutado, el
 * menú y el conmutador de idioma; el slug sólo aparece en la URL final.
 *
 * Añadir una página = una entrada aquí y su componente. Añadir un idioma =
 * una columna aquí. El enrutado (`src/pages/[...path].astro`) se genera a
 * partir de este mapa, así que nunca hay que crear ficheros de página por
 * combinación de idioma y sección.
 */
import { defaultLang, type Lang } from './ui';

export const pageKeys = ['home', 'export', 'tastings', 'privacy'] as const;
export type PageKey = (typeof pageKeys)[number];

/** Slug de cada página por idioma. Cadena vacía = raíz del idioma. */
export const slugs: Record<PageKey, Record<Lang, string>> = {
  home: { es: '', en: '' },
  export: { es: 'exportacion', en: 'export' },
  tastings: { es: 'catas', en: 'wine-events' },
  privacy: { es: 'privacidad', en: 'privacy' },
};

/**
 * URL de una página en un idioma: "/", "/en/", "/catas/", "/en/wine-events/".
 * El idioma por defecto no lleva prefijo (`prefixDefaultLocale: false`).
 *
 * Siempre con barra final, para que coincida exactamente con la URL que
 * genera Astro en el build (`build.format: 'directory'`). Si el `hreflang`
 * y el `canonical` de una misma página difirieran en la barra, Google los
 * leería como URLs distintas y el grupo de idiomas no validaría.
 */
export function pageUrl(page: PageKey, lang: Lang): string {
  const slug = slugs[page][lang];
  const base = lang === defaultLang ? '' : `/${lang}`;
  if (!slug) return base === '' ? '/' : `${base}/`;
  return `${base}/${slug}/`;
}

/** Segmentos de ruta que consume `getStaticPaths` (undefined = raíz). */
export function pathParam(page: PageKey, lang: Lang): string | undefined {
  const segments = [lang === defaultLang ? '' : lang, slugs[page][lang]].filter(Boolean);
  return segments.length ? segments.join('/') : undefined;
}
