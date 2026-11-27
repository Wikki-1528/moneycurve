# MoneyCurve

Free money calculators: loan EMI, goal planner, FD returns, retirement, inflation, card payoff, and a CIBIL score estimator.

Plain HTML, CSS and JavaScript. No install, no build step.

## Run it

Pick one:

- Double-click `index.html`.
- In VS Code: open this folder, press `F5` (Run MoneyCurve). Chrome opens the site.
- In VS Code terminal:

  ```bash
  open -a "Google Chrome" index.html
  ```

- With the Live Server extension: right-click `index.html`, choose "Open with Live Server". Page reloads on every save.

## Files

```
index.html        Home page
calculator.html   All seven tools (calculator.html#fd opens FD directly)
about.html        About, methods, disclaimer
css/styles.css    All styles. Colors are variables at the top, in :root
js/data.js        Tool names, descriptions, slider settings
js/calculators.js Math only
js/charts.js      Line chart and score gauge
js/app.js         Calculator page: sliders, results, tabs
js/site.js        Shared: mobile menu, footer, tool lists
assets/           Favicon
```

## Change colors

Open `css/styles.css` and edit the values in `:root`. `--a` is the main color, `--b` the second color.

## Add a calculator

1. `js/data.js`: add an entry to `CALCS` (name, title, desc, method) and to `FIELDS` (its sliders).
2. `js/calculators.js`: add a `calcSomething()` function that returns the numbers.
3. `js/app.js`: add an `else if (state.tab === 'something')` branch in `render()` that calls `showStats()` and `drawChart()`.

The tab, home page card and footer link appear automatically.

## Publish

Upload the whole folder to any static host (GitHub Pages, Netlify, Vercel). `index.html` must stay at the top level.
