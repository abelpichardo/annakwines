/**
 * PostCSS — resuelve los breakpoints tokenizados.
 *
 * `@csstools/postcss-global-data` inyecta las definiciones `@custom-media`
 * de `src/styles/breakpoints.css` en cada fichero CSS y en cada bloque
 * `<style>` con scope de los componentes `.astro`, para que todos puedan
 * escribir `@media (--to-sm)` sin importar nada.
 *
 * Sustituye a la opción `importFrom`, eliminada en postcss-custom-media v10.
 */
import globalData from '@csstools/postcss-global-data';
import customMedia from 'postcss-custom-media';

export default {
  plugins: [globalData({ files: ['src/styles/breakpoints.css'] }), customMedia()],
};
