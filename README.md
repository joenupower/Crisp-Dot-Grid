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

## License

MIT
