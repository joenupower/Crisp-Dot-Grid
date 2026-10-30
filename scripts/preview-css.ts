/*
 * Prints the CSS the plugin generates for every preset, so the output can be
 * eyeballed (and pasted into the RemNote Custom CSS block) without building
 * and installing the plugin.
 *
 *   npx esbuild scripts/preview-css.ts --bundle --platform=node --outfile=/tmp/p.cjs && node /tmp/p.cjs
 */
import { buildCss, LEVELS, MATCH_LIGHT } from '../src/dotGrid';

const base = {
  darkChoice: MATCH_LIGHT,
  lightColour: '0, 0, 0',
  darkColour: '255, 255, 255',
  customOpacity: 0.5,
  customSize: 6.5,
};

for (const level of Object.keys(LEVELS)) {
  console.log(`/* ===== ${level} ===== */`);
  console.log(buildCss({ ...base, lightChoice: level }));
  console.log();
}

console.log('/* ===== custom: opacity 0.7, size 8 ===== */');
console.log(
  buildCss({ ...base, lightChoice: 'custom', customOpacity: 0.7, customSize: 8 })
);
console.log();

console.log('/* ===== dark set separately to Strong ===== */');
console.log(buildCss({ ...base, lightChoice: 'subtle', darkChoice: 'strong' }));
console.log();

console.log('/* ===== malformed colour input "nonsense" falls back ===== */');
console.log(buildCss({ ...base, lightChoice: 'medium', lightColour: 'nonsense' }));
