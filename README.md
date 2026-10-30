# Crisp Dot Grid

Makes the dot grid on RemNote's **infinite drawing canvas** properly visible — at every zoom level.

### Light canvas background

![The dot grid on a light canvas, stepping from RemNote's default through all five visibility levels](https://raw.githubusercontent.com/joenupower/Crisp-Dot-Grid/main/docs/dot-grid-light.gif)

### Dark canvas background

![The same five levels on a dark canvas, where the dots are drawn in white](https://raw.githubusercontent.com/joenupower/Crisp-Dot-Grid/main/docs/dot-grid-dark.gif)

Both clips are 1:1 screen captures — no resizing, so the dots appear exactly as they render on screen. The first frame of each is RemNote untouched.

## The problem

RemNote draws the canvas dot grid as a CSS radial gradient. Two things make it hard to see:

- **The dots are almost transparent.** Alpha is `0.176` on a light background, which puts the dots at roughly 96% brightness on white.
- **The solid core of each dot is only `0.3px`.** That is smaller than a single screen pixel, so what you actually see is mostly the soft falloff. How much of it survives depends on where the dot centre happens to land inside a pixel — and that shifts with every zoom step. This is why the grid looks fine at one zoom level and nearly vanishes at the next.

RemNote also *clamps* the dot at `0.3px`, so when you zoom out below 100% the grid spacing keeps shrinking while the dot does not — the point where the grid disappears entirely.

## What this plugin does

It replaces only the `background-image` of the grid layer, leaving `background-size` and `transform` to RemNote so the spacing stays tied to the canvas zoom.

The dot radius is given as a **percentage of the grid cell**, which resolves against `background-size` and therefore follows the zoom on its own — no JavaScript polling, no observers. A `max()` floor keeps the dot readable when you zoom out, which is where RemNote's own clamp gives up.

```css
.drawing-canvas-infinite-background div[style*="rgba(0, 0, 0,"] {
  background-image: radial-gradient(
    rgba(0, 0, 0, 0.5) max(0.91px, 6.5%),
    transparent        max(1.26px, 9%)) !important;
}
```

Light and dark canvas backgrounds are told apart by the colour RemNote itself writes into the inline style (black dots vs. white dots), so there is no theme detection to get out of sync. If RemNote ever paints the grid in some third colour, neither rule matches and the grid is left untouched.

## Settings

| Setting | Default |
| --- | --- |
| Enable dot grid enhancement | on |
| Dot visibility | Medium |
| Dot visibility (dark background) | Match light background |
| Dot colour on light background (R, G, B) | `0, 0, 0` |
| Dot colour on dark background (R, G, B) | `255, 255, 255` |
| Custom opacity | 0.5 |
| Custom dot size (% of grid cell) | 6.5 |

The five levels:

| Level | Opacity | Dot core | Fade out |
| --- | --- | --- | --- |
| Very subtle | 0.28 | 5% | 7% |
| Subtle | 0.38 | 6% | 8.5% |
| Medium | 0.50 | 6.5% | 9% |
| Pronounced | 0.62 | 7.5% | 10% |
| Strong | 0.78 | 8.5% | 11.5% |

Choosing **Custom** uses the two numeric settings instead. The dark background follows the light setting with a little extra opacity unless you give it a level of its own.

## Scope and limits

- Applies to the **infinite canvas** only. Page-based handwritten documents use a different container and are not touched.
- PDF annotations, image drawings and inline drawings are unaffected.
- `.drawing-canvas-infinite-background` and the inline gradient are not a documented, stable RemNote interface. A RemNote update can change them, in which case the plugin quietly stops having an effect rather than breaking anything. Worth a quick check after major updates.

## Development

```bash
npm install
npm run dev     # then: Settings -> Plugins -> Build -> Develop from Localhost
npm run build   # produces PluginZip.zip for the marketplace
```

## License

MIT
