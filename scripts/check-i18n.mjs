/**
 * Valida que todos los diccionarios de idioma compartan exactamente la misma
 * estructura de claves (incluida la longitud de los arrays y el tipo de cada
 * hoja). Falla con código de salida 1 si hay claves faltantes, sobrantes o de
 * tipo distinto respecto al idioma base. Se ejecuta con `npm run lint:i18n` y
 * como parte de `prebuild`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(dir, '..', 'src', 'i18n');
const BASE = 'es';

/**
 * Los idiomas se descubren leyendo el directorio, no con una lista fija: así
 * añadir o retirar un idioma nunca requiere tocar este script.
 */
const LOCALES = readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort((a, b) => (a === BASE ? -1 : b === BASE ? 1 : a.localeCompare(b)));

if (!LOCALES.includes(BASE)) {
  console.error(`i18n: falta el diccionario base ${BASE}.json. \u2717`);
  process.exit(1);
}

const load = (loc) => JSON.parse(readFileSync(join(I18N_DIR, `${loc}.json`), 'utf8'));

/** Aplana un objeto a un Map "ruta -> tipo de hoja". Los arrays codifican su longitud. */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    out.set(prefix, `array[${value.length}]`);
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      flatten(value[key], prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.set(prefix, typeof value);
  }
  return out;
}

const maps = Object.fromEntries(LOCALES.map((l) => [l, flatten(load(l))]));
const base = maps[BASE];
let problems = 0;

for (const loc of LOCALES) {
  if (loc === BASE) continue;
  const m = maps[loc];
  const missing = [...base.keys()].filter((k) => !m.has(k));
  const extra = [...m.keys()].filter((k) => !base.has(k));
  const mismatched = [...base.keys()].filter((k) => m.has(k) && m.get(k) !== base.get(k));

  if (missing.length || extra.length || mismatched.length) {
    problems += 1;
    console.error(`\n✗ ${loc}.json difiere de ${BASE}.json:`);
    missing.forEach((k) => console.error(`   falta:  ${k}`));
    extra.forEach((k) => console.error(`   sobra:  ${k}`));
    mismatched.forEach((k) =>
      console.error(`   tipo:   ${k} (${BASE}=${base.get(k)}, ${loc}=${m.get(k)})`)
    );
  }
}

if (problems) {
  console.error(`\ni18n: ${problems} idioma(s) con claves desalineadas. ✗`);
  process.exit(1);
}

console.log(`i18n: ${LOCALES.length} idiomas · ${base.size} claves alineadas. ✓`);
