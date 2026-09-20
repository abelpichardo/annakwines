/**
 * Datos NO lingüísticos del sitio: identidad, redes, denominaciones,
 * constantes de presentación y datos legales. Toda la copy traducible vive
 * en `src/i18n/*.json`; aquí sólo hay valores independientes del idioma.
 */
import type { PageKey } from '@i18n/routes';

export const SITE_NAME = 'Anna K Wines';
export const TAGLINE = 'The Spanish Wine Connection';

/** Marca de la pata de catas y enoturismo (B2C, Costa Blanca). */
export const TASTINGS_BRAND = 'Costa Blanca Wine Club';

/** Enlaces del menú principal, por clave de página. Incluye 'home' para
 * poder volver al inicio desde cualquier página sin depender sólo del logo. */
export const navPages: readonly PageKey[] = ['home', 'export', 'tastings'];

/** Enlaces del pie. */
export const footerPages: readonly PageKey[] = ['export', 'tastings', 'privacy'];

export const contact = {
  email: 'hola@annakwines.com',
} as const;

/** Forma de un enlace social. Declarada, no inferida de una de las listas. */
export interface SocialLink {
  network: 'facebook' | 'instagram' | 'linkedin';
  handle: string;
  /** Vacío mientras la cuenta no exista. */
  href: string;
  /** `true` = cuenta aún no creada: se muestra, pero no enlaza. */
  pending: boolean;
}

/**
 * Redes sociales, agrupadas por marca.
 *
 * `annak` son las cuentas existentes de Anna Granqvist. `tastings` son las
 * de Costa Blanca Wine Club: aún no existen, así que se marcan con
 * `pending: true` y se muestran como "cuenta en preparación" en lugar de
 * enlazar a un 404. En cuanto existan, basta con poner la URL y quitar el flag.
 */
export const social: Record<'annak' | 'tastings', readonly SocialLink[]> = {
  annak: [
    {
      network: 'instagram',
      handle: '@annakwines',
      href: 'https://instagram.com/annakwines',
      pending: false,
    },
    {
      network: 'facebook',
      handle: '@annakwines',
      href: 'https://facebook.com/annakwines',
      pending: false,
    },
    {
      network: 'linkedin',
      handle: 'Anna Granqvist',
      href: 'https://www.linkedin.com/',
      pending: true,
    },
  ],
  tastings: [
    {
      network: 'facebook',
      handle: '@costablancawineclub',
      href: '',
      pending: true,
    },
    {
      network: 'instagram',
      handle: '@costablancawineclub',
      href: '',
      pending: true,
    },
  ],
};

/** Inicial del sello de cada acreditación, emparejada con `home.certs.items`. */
export const certMeta = [
  { seal: 'D' },
  { seal: 'W' },
  { seal: 'J' },
  { seal: 'M' },
  { seal: 'C' },
  { seal: 'A' },
] as const;

/** Numeral (serif) de cada servicio de exportación. */
export const serviceMeta = [
  { num: 'i' },
  { num: 'ii' },
  { num: 'iii' },
  { num: 'iv' },
  { num: 'v' },
] as const;

/**
 * Denominaciones de origen representadas. Se publican las zonas y el perfil
 * de productor, no los nombres de las bodegas: parte de la información es
 * comercialmente sensible y nombrar clientes puede chocar con acuerdos de
 * exclusividad.
 */
export const denominations = [
  'DO Campo de Borja',
  'DO Valdeorras',
  'DO Bierzo',
  'DO Toro',
  'DO Rueda',
  'Cebreros',
] as const;

/** Enlace oficial del programa de consumo responsable. */
export const WINE_IN_MODERATION_URL = 'https://wineinmoderation.eu/es';

/**
 * Datos del responsable del tratamiento (RGPD + LSSI art. 10).
 *
 * `address` está deliberadamente vacío: el domicilio social coincide con el
 * domicilio particular de la fundadora. La LSSI obliga a publicar el
 * domicilio del prestador, así que antes de publicar hay que decidir entre
 * trasladar el domicilio social (gestoría o coworking) o aceptar publicar
 * el actual. La página legal omite la línea mientras esté vacío.
 */
export const legal = {
  company: 'SALP Consulting S.L.U',
  nif: 'B85934917',
  address: '',
  email: contact.email,
} as const;
