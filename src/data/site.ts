/**
 * Datos NO lingüísticos del sitio: constantes de presentación (numerales,
 * sellos, banderas, iniciales) y configuración de contacto. Se emparejan por
 * índice con los arrays traducidos de los diccionarios (`services.items`,
 * `certs.items`, `markets.items`, `testimonials.items`).
 *
 * Toda la copy traducible vive en `src/i18n/*.json`; aquí solo hay valores
 * independientes del idioma. Los datos de contacto son PLACEHOLDERS: sustituir
 * por los reales antes de publicar.
 */
import type { Dictionary } from '@i18n/ui';

export const SITE_NAME = 'Anna K Wines';

type NavKey = keyof Dictionary['nav'];

/** Enlaces del nav central (ancla + clave de traducción). */
export const navLinks: readonly { key: NavKey; href: string }[] = [
  { key: 'about', href: '#about' },
  { key: 'work', href: '#bridge' },
  { key: 'services', href: '#services' },
  { key: 'certs', href: '#certs' },
  { key: 'markets', href: '#markets' },
];

/** Enlaces del footer. */
export const footerLinks: readonly { key: NavKey; href: string }[] = [
  { key: 'about', href: '#about' },
  { key: 'services', href: '#services' },
  { key: 'contact', href: '#contact' },
];

/** Numeral (serif) de cada servicio, emparejado con `services.items`. */
export const serviceMeta = [{ num: 'i' }, { num: 'ii' }, { num: 'iii' }, { num: 'iv' }] as const;

/** Inicial del sello de cada acreditación, emparejada con `certs.items`. */
export const certMeta = [
  { seal: 'W' },
  { seal: 'W' },
  { seal: 'S' },
  { seal: 'E' },
  { seal: 'J' },
  { seal: 'C' },
] as const;

/** Bandera, código y si es mercado principal, emparejado con `markets.items`. */
export const marketMeta = [
  { code: 'pl', flag: '🇵🇱', main: true },
  { code: 'de', flag: '🇩🇪', main: true },
  { code: 'fi', flag: '🇫🇮', main: true },
  { code: 'se', flag: '🇸🇪', main: false },
  { code: 'no', flag: '🇳🇴', main: false },
  { code: 'dk', flag: '🇩🇰', main: false },
] as const;

/** Inicial del avatar de cada testimonio, emparejada con `testimonials.items`. */
export const testimonialMeta = [{ avatar: 'B' }, { avatar: 'N' }] as const;

/** Logos placeholder de bodegas (nombres propios, no se traducen). */
export const wineryLogos = ['Bodega Uno', 'Viña Dos', 'Pago Tres', 'Cava Cuatro'] as const;

/** Métodos de contacto directos. PLACEHOLDERS — sustituir por los reales. */
export const contact = {
  email: 'hola@annakwines.com',
  whatsapp: { display: 'WhatsApp', href: 'https://wa.me/34600000000' },
  instagram: { display: '@annakwines', href: 'https://instagram.com/annakwines' },
  linkedin: { display: 'LinkedIn', href: 'https://www.linkedin.com/' },
} as const;
