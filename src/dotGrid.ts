/*
 * Pure helpers that turn the plugin settings into the CSS RemNote gets.
 *
 * Kept free of any SDK import so the generated CSS can be inspected and tested
 * on its own (see scripts/preview-css.ts).
 *
 * How this plugin hooks into RemNote
 * ----------------------------------
 * The dot grid of the infinite drawing canvas is a plain CSS background on a
 * div inside `.drawing-canvas-infinite-background`. RemNote writes it into an
 * inline `style` attribute and recomputes it on every zoom step, roughly:
 *
 *   background-image: radial-gradient(rgba(0, 0, 0, 0.176) 0.3px, transparent 1.2px);
 *   background-size:  24px 24px;            // scales with the canvas zoom
 *
 * On a dark canvas background RemNote swaps the dot colour to white:
 *
 *   background-image: radial-gradient(rgba(255, 255, 255, 0.314) 0.3px, transparent 1.2px);
 *
 * That colour is our light/dark hook: instead of detecting the theme, the two
 * selectors below key off the colour RemNote itself put in the inline style.
 * If RemNote ever paints the grid in some third colour, neither rule matches
 * and the grid is simply left alone.
 *
 * Inline styles beat normal CSS, so every rule here needs `!important`.
 * We only replace `background-image`; `background-size` and `transform` stay
 * RemNote's, which is what keeps the grid spacing glued to the canvas zoom.
 */

export const LIGHT_SELECTOR =
  '.drawing-canvas-infinite-background div[style*="rgba(0, 0, 0,"]';
export const DARK_SELECTOR =
  '.drawing-canvas-infinite-background div[style*="rgba(255, 255, 255,"]';

export interface Level {
  /** Alpha of the dot colour, 0 to 1. */
  opacity: number;
  /** Radius of the solid dot core, in % of the grid cell. */
  core: number;
  /** Radius at which the dot has faded out, in % of the grid cell. */
  fade: number;
}

export const LEVELS: Record<string, Level> = {
  'very-subtle': { opacity: 0.28, core: 5, fade: 7 },
  subtle: { opacity: 0.38, core: 6, fade: 8.5 },
  medium: { opacity: 0.5, core: 6.5, fade: 9 },
  pronounced: { opacity: 0.62, core: 7.5, fade: 10 },
  strong: { opacity: 0.78, core: 8.5, fade: 11.5 },
};

export const LEVEL_OPTIONS = [
  { key: 'very-subtle', label: 'Very subtle', value: 'very-subtle' },
  { key: 'subtle', label: 'Subtle', value: 'subtle' },
  { key: 'medium', label: 'Medium', value: 'medium' },
  { key: 'pronounced', label: 'Pronounced', value: 'pronounced' },
  { key: 'strong', label: 'Strong', value: 'strong' },
  { key: 'custom', label: 'Custom (use the two values below)', value: 'custom' },
];

export const MATCH_LIGHT = 'match';

/** Extra alpha the dark canvas gets when it follows the light setting. */
export const DARK_OPACITY_BOOST = 0.05;

/**
 * Minimum dot radius in px per 1% of cell size.
 *
 * Percentages resolve against the grid cell, so they follow the canvas zoom by
 * themselves. But RemNote clamps its own dot at 0.3px, meaning that below 100%
 * zoom the cell keeps shrinking while the dot does not. Left purely in
 * percent, our dots would shrink past the point of visibility: measured at 28%
 * zoom, the floor below makes them about 5.6x brighter.
 */
export const FLOOR_PX_PER_PERCENT = 0.14;

/** Ratio of fade radius to core radius, taken from the Medium preset (9 / 6.5). */
export const FADE_RATIO = 1.4;

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** Drops trailing zeros so the generated CSS stays readable. */
function num(value: number): string {
  return String(Number(value.toFixed(3)));
}

export function gradient(rgb: string, level: Level): string {
  const floor = (percent: number) => num(percent * FLOOR_PX_PER_PERCENT);
  return (
    `radial-gradient(` +
    `rgba(${rgb}, ${num(level.opacity)}) max(${floor(level.core)}px, ${num(level.core)}%), ` +
    `transparent max(${floor(level.fade)}px, ${num(level.fade)}%))`
  );
}

export function resolveLevel(
  choice: string,
  customOpacity: number,
  customSize: number
): Level {
  if (choice === 'custom') {
    const core = clamp(Number(customSize) || LEVELS.medium.core, 1, 25);
    return {
      opacity: clamp(Number(customOpacity) || LEVELS.medium.opacity, 0.02, 1),
      core,
      fade: clamp(core * FADE_RATIO, 1, 35),
    };
  }
  return LEVELS[choice] ?? LEVELS.medium;
}

/**
 * Turns user input such as "12, 34, 56" into a safe `r, g, b` string. Anything
 * malformed falls back, so a typo in the settings can never produce broken CSS
 * that would take the whole rule down with it.
 */
export function sanitiseRgb(value: string, fallback: string): string {
  const parts = String(value ?? '')
    .split(',')
    .map((part) => Number(part.trim()));
  const valid =
    parts.length === 3 &&
    parts.every((part) => Number.isFinite(part) && part >= 0 && part <= 255);
  return valid ? parts.map((part) => Math.round(part)).join(', ') : fallback;
}

export interface GridSettings {
  lightChoice: string;
  darkChoice: string;
  lightColour: string;
  darkColour: string;
  customOpacity: number;
  customSize: number;
}

/** Builds the full stylesheet the plugin hands to RemNote. */
export function buildCss(settings: GridSettings): string {
  const light = resolveLevel(
    settings.lightChoice,
    settings.customOpacity,
    settings.customSize
  );
  const dark =
    settings.darkChoice === MATCH_LIGHT
      ? { ...light, opacity: clamp(light.opacity + DARK_OPACITY_BOOST, 0, 1) }
      : resolveLevel(settings.darkChoice, settings.customOpacity, settings.customSize);

  const lightRgb = sanitiseRgb(settings.lightColour, '0, 0, 0');
  const darkRgb = sanitiseRgb(settings.darkColour, '255, 255, 255');

  return [
    `${LIGHT_SELECTOR} { background-image: ${gradient(lightRgb, light)} !important; }`,
    `${DARK_SELECTOR} { background-image: ${gradient(darkRgb, dark)} !important; }`,
  ].join('\n');
}
