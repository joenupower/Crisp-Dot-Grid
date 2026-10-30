import { declareIndexPlugin, ReactRNPlugin } from '@remnote/plugin-sdk';
import { buildCss, LEVELS, LEVEL_OPTIONS, MATCH_LIGHT } from '../dotGrid';

const CSS_ID = 'crisp-dot-grid';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerBooleanSetting({
    id: 'enabled',
    title: 'Enable dot grid enhancement',
    description: "Turn off to fall back to RemNote's original dot grid.",
    defaultValue: true,
  });

  await plugin.settings.registerDropdownSetting({
    id: 'visibility',
    title: 'Dot visibility',
    description: 'How strongly the dots stand out on a light canvas background.',
    defaultValue: 'medium',
    options: LEVEL_OPTIONS,
  });

  await plugin.settings.registerDropdownSetting({
    id: 'visibility-dark',
    title: 'Dot visibility (dark background)',
    description:
      'Leave this on "Match light background" unless the dark canvas needs a level of its own.',
    defaultValue: MATCH_LIGHT,
    options: [
      { key: MATCH_LIGHT, label: 'Match light background', value: MATCH_LIGHT },
      ...LEVEL_OPTIONS,
    ],
  });

  await plugin.settings.registerStringSetting({
    id: 'colour-light',
    title: 'Dot colour on light background (R, G, B)',
    description: 'Three numbers from 0 to 255. Default is black.',
    defaultValue: '0, 0, 0',
  });

  await plugin.settings.registerStringSetting({
    id: 'colour-dark',
    title: 'Dot colour on dark background (R, G, B)',
    description: 'Three numbers from 0 to 255. Default is white.',
    defaultValue: '255, 255, 255',
  });

  await plugin.settings.registerNumberSetting({
    id: 'custom-opacity',
    title: 'Custom opacity',
    description: 'Between 0 and 1. Only used when "Dot visibility" is set to Custom.',
    defaultValue: LEVELS.medium.opacity,
  });

  await plugin.settings.registerNumberSetting({
    id: 'custom-size',
    title: 'Custom dot size (% of grid cell)',
    description:
      'Around 6.5 matches the Medium preset. Only used when "Dot visibility" is set to Custom.',
    defaultValue: LEVELS.medium.core,
  });

  // Re-registering the same CSS id replaces the previous stylesheet, so this
  // runs again on every settings change and the canvas updates live.
  plugin.track(async (reactivePlugin) => {
    const enabled = await reactivePlugin.settings.getSetting<boolean>('enabled');
    if (!enabled) {
      await reactivePlugin.app.registerCSS(CSS_ID, '');
      return;
    }

    const css = buildCss({
      lightChoice: await reactivePlugin.settings.getSetting<string>('visibility'),
      darkChoice: await reactivePlugin.settings.getSetting<string>('visibility-dark'),
      lightColour: await reactivePlugin.settings.getSetting<string>('colour-light'),
      darkColour: await reactivePlugin.settings.getSetting<string>('colour-dark'),
      customOpacity: await reactivePlugin.settings.getSetting<number>('custom-opacity'),
      customSize: await reactivePlugin.settings.getSetting<number>('custom-size'),
    });

    await reactivePlugin.app.registerCSS(CSS_ID, css);
  });
}

async function onDeactivate(plugin: ReactRNPlugin) {
  await plugin.app.registerCSS(CSS_ID, '');
}

declareIndexPlugin(onActivate, onDeactivate);
