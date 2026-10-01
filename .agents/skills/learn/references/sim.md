# Simulations

A simulation is the **See** move: I change one thing and watch what happens to another.
It earns its place when the idea is about something that *varies*: a shape that depends
on a parameter, a process that repeats, a quantity that settles, a trade-off. A
simulation that only animates a sentence is noise. If nothing varies, skip it.

## How to make one

1. Write one file, `learn/<lesson>/sims/<name>.html`, lowercase with hyphens. A changed
   version is a new file (`coin-flips-2.html`), not an overwrite, unless you are fixing a bug.
2. Show it on the screen with a fenced block containing only the path:

   ````
   ```sim
   learn/normal-distribution/sims/coin-flips.html
   ```
   ````

3. On the same screen, **ask me to predict first**: "Before you move the slider: what
   happens to the shape when n goes from 4 to 100?" Then tell me what to do in one line.
   Prediction, then observation, is the whole point.

The file loads `lesson/sim.js`, which gives it the lesson's look, dark mode, controls and
plots, so you write only the idea. It also opens on its own with a double-click.

## A complete example

```html
<!doctype html>
<meta charset="utf-8">
<body>
<script src="../../../lesson/sim.js"></script>
<script>
const sim = Sim({
  title: 'Totals of n coin flips',
  caption: 'Each run flips n coins and counts the heads. Bars: how often each total came up.'
});
const n = sim.slider('flips per run', 1, 60, 4);
const p = sim.slider('P(heads)', 0.1, 0.9, 0.5, 0.05);
const theory = sim.toggle('show the theory curve', false);
let counts = [], runs = 0;
function reset() { counts = new Array(n.value + 1).fill(0); runs = 0; }
function run(times) {
  for (let r = 0; r < times; r++) {
    let heads = 0;
    for (let i = 0; i < n.value; i++) if (Math.random() < p.value) heads++;
    counts[heads]++; runs++;
  }
}
n.onchange = reset; p.onchange = reset;
sim.button('Run 1', () => run(1));
sim.button('Run 1000', () => run(1000));
sim.button('Reset', reset);

const plot = sim.canvas(280);
const shownRuns = sim.readout('runs'), shownMean = sim.readout('mean total'), shownSd = sim.readout('theory σ');

function binomial(k) {                     // P(total = k), computed in logs so n = 60 does not overflow
  let logC = 0;
  for (let i = 1; i <= k; i++) logC += Math.log(n.value - k + i) - Math.log(i);
  return Math.exp(logC + k * Math.log(p.value) + (n.value - k) * Math.log(1 - p.value));
}

reset();
sim.draw(() => {
  plot.clear();
  plot.bars(counts, {
    xlabel: 'number of heads',
    overlay: theory.value && runs ? counts.map((_, k) => binomial(k) * runs) : null
  });
  const mean = runs ? counts.reduce((s, c, k) => s + c * k, 0) / runs : 0;
  shownRuns(runs); shownMean(runs ? mean.toFixed(2) : '–'); shownSd(Math.sqrt(n.value * p.value * (1 - p.value)).toFixed(2));
});
</script>
```

## The kit

`const sim = Sim({ title, caption })` then, in the order they should appear:

| call | gives you |
|---|---|
| `sim.slider(label, min, max, value, step)` | `.value` (a number). Set `.onchange = fn` to react |
| `sim.toggle(label, on)` | `.value` (true/false) |
| `sim.select(label, ['a', 'b'], 'a')` | `.value` (the chosen string) |
| `sim.button(label, fn)` | runs `fn`, then redraws |
| `sim.readout(label)` | a setter: `const m = sim.readout('mean'); m(4.98)` |
| `sim.canvas(height)` | a plot (below) |
| `sim.draw(fn)` | `fn` runs after every control change, button press and resize. Draw everything here |
| `sim.animate((dt, t) => …)` | `.start()`, `.stop()`, `.toggle()`; redraws every frame while running |
| `sim.note(text)` | a small line under the plot |
| `sim.colors` | `.accent .ink .soft .line .good .warn`, already right for light and dark |

A plot, from `sim.canvas`:

| call | draws |
|---|---|
| `plot.clear()` | first line of every draw |
| `plot.bars(values, { labels, xlabel, max, highlight: i => bool, overlay: [y…] })` | one bar per value; `overlay` is a line through the same positions |
| `plot.axes({ xmin, xmax, ymin, ymax, xlabel, ylabel })` | axes with ticks. Call before the four below |
| `plot.line([[x, y], …], { color, width, dash })` | a line in axes units |
| `plot.fn(x => y, { color })` | a function across the x range |
| `plot.points([[x, y], …], { color, r })` | dots |
| `plot.text('label', x, y)` | a label at a point |
| `plot.ctx`, `plot.w`, `plot.h` | the raw canvas, for anything else |

## Rules

- **One idea, at most three controls.** A simulation with six sliders teaches nothing.
- **It must be right.** I will trust what I see. Compute, do not fake: real random
  draws, the real formula. If there is a theory curve, derive it from the same parameters.
- **You cannot see it, so keep it simple and re-read it.** Before showing it, trace the
  code once by hand: every variable defined, `plot.clear()` first, `plot.axes` before
  `line`/`fn`/`points`/`text`, nothing that divides by zero at the slider's smallest value.
- **Do not show the answer.** No readout, label or curve may state the thing I am
  supposed to discover (the "target", the formula, the limit). Show what I can
  measure; let me find the pattern. A theory curve goes behind a toggle that starts off.
- **Use the kit's colours.** No hard-coded colours, no extra CSS, no libraries.
- **Start in the interesting state**, where the thing I am about to predict is visible
  after one click or one drag.
- Put the `<script>` tags inside `<body>`, and keep the `../../../lesson/sim.js` path, as in the example.
- If I paste an error from the simulation, fix the file, then tell me to click **reload** under it.
