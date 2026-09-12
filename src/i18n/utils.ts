/**
 * Helpers de i18n construidos sobre el enrutado nativo de Astro (`astro:i18n`).
 *
 * - `getLangFromUrl`   → idioma activo a partir de la URL.
 * - `useTranslations`  → diccionario tipado del idioma (acceso por propiedad:
 *                        `t.hero.title`, `t.services.items.map(...)`). Se
 *                        prefiere el acceso por propiedad a un `t('a.b')`
 *                        stringly-typed porque da autocompletado, detección de
 *                        claves inexistentes en compilación y acceso a arrays.
 * - `useTranslatedPath`→ rutas internas localizadas vía `getRelativeLocaleUrl`.
 */
import { getRelativeLocaleUrl } from 'astro:i18n';
import { ui, defaultLang, langCodes, type Lang, type Dictionary } from './ui';

/** Deriva el idioma activo del primer segmento de la ruta ("/en/…" → "en"). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if ((langCodes as string[]).includes(seg)) return seg as Lang;
  return defaultLang;
}

/** Diccionario tipado del idioma, con fallback al idioma por defecto. */
export function useTranslations(lang: Lang): Dictionary {
  return (ui[lang] ?? ui[defaultLang]) as Dictionary;
}

/**
 * Devuelve una función que construye rutas localizadas.
 * Ej.: `const localize = useTranslatedPath('en'); localize('') // → "/en/"`.
 */
export function useTranslatedPath(lang: Lang) {
  return (path = ''): string => getRelativeLocaleUrl(lang, path);
}

/** Ruta raíz localizada de cada idioma (para el conmutador y los `hreflang`). */
export function localeHomeUrls(): Record<Lang, string> {
  return Object.fromEntries(
    langCodes.map((lang) => [lang, getRelativeLocaleUrl(lang, '')])
  ) as Record<Lang, string>;
}
