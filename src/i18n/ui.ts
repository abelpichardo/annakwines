/**
 * Registro central de idiomas y diccionarios.
 *
 * `es.json` es el fichero base del que se deriva el tipo `Dictionary`, de modo
 * que cualquier acceso a una clave inexistente (p. ej. `t.hero.tittle`) es un
 * error de compilación. `en.json` y `sv.json` deben compartir exactamente la
 * misma estructura — lo garantiza `scripts/check-i18n.mjs` (`npm run lint:i18n`).
 */
import es from './es.json';
import en from './en.json';
import sv from './sv.json';

/** Idiomas soportados y su etiqueta en el conmutador. */
export const languages = {
  es: 'Español',
  en: 'English',
  sv: 'Svenska',
} as const;

/** Idioma por defecto (vive en la raíz, sin prefijo). Debe coincidir con astro.config.mjs. */
export const defaultLang = 'es' as const;

/** Diccionarios cargados por idioma. */
export const ui = { es, en, sv } as const;

export type Lang = keyof typeof ui; // 'es' | 'en' | 'sv'
export type Dictionary = typeof es; // forma canónica derivada del idioma base

export const langCodes = Object.keys(ui) as Lang[];

/** Etiquetas BCP-47 para `<html lang>`, `hreflang` y `og:locale`. */
export const localeTags: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en',
  sv: 'sv-SE',
};
