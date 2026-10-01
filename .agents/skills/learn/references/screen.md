# The lesson screen

Each screen is a new file: `learn/<lesson>/screens/01.html`, then `02.html`, `03.html`
and so on, two digits, no gaps. `lesson.html` picks a new file up within a second and
keeps the earlier screens above it. Never overwrite a screen that I have answered. If a
screen has a mistake and I have not answered yet, you may rewrite that one file.

`<lesson>` is the topic in lowercase with hyphens: `normal-distribution`.

## Starting a lesson

Write `learn/current.html` once, so the page knows which folder to show. It is exactly
this one line, with your folder name in the middle:

```
<!doctype html><meta charset="utf-8"><script type="text/plain" id="s">normal-distribution</script><script>parent.postMessage({ lessonFile: location.href, text: document.getElementById("s").textContent }, "*")</script>
```

It is the only file that is replaced when a new lesson starts.

## A screen file

The first line and the last line are fixed. Copy them exactly; they are what hands the
text to the page. Everything between them is the screen, written as Markdown.

````
<!doctype html><meta charset="utf-8"><script type="text/plain" id="s">
# Normal distribution
step: check
you: B, because the variance adds

## Map
- [have] a. Variance of a binomial
- [shaky] b. Counting outcomes
- [done] 1. Middle totals happen in more ways <- a, b
- [now] 2. Average settling vs shape appearing <- 1
- [todo] 3. The normal curve as the limit <- 2

## Screen
Right. The spread of the total is $\sigma = \sqrt{np(1-p)}$.

For $X \sim \text{Binomial}(100, 0.5)$, about 95% of totals fall between which two values?

## Ask
choice
- 45 and 55
- 40 and 60
- 30 and 70
- 48 and 52
</script><script>parent.postMessage({ lessonFile: location.href, text: document.getElementById("s").textContent }, "*")</script>
````

Nothing between the two fixed lines needs escaping: backslashes, `$`, `<`, backticks
are all fine. The one thing you may not write there is a `</script>` tag.

| part | what goes there |
|---|---|
| `# Title` | the topic. Keep it identical on every screen of the lesson |
| `step:` | `probe`, `plan`, `teach`, `check` or `log`. Lights up the step at the top of the page |
| `you:` | what I answered to the previous screen, in a few words. The page files it under that screen. Leave out on the first screen |
| `## Map` | the map. The page draws it as a diagram; see "The map" below. Leave the section out during the probe |
| `## Screen` | what I read. Markdown: paragraphs, `###` headings, lists, **bold**, `> quote`, tables, code |
| `## Ask` | first line is the kind of answer I should give; see below |

Keep the three `##` headings exactly as written. Use `###` for headings inside the screen.

## The map

The page turns `## Map` into a mermaid graph: one node per line, one arrow per
dependency, each node coloured by its state. You write the lines; you never write the
mermaid for it.

```
- [state] name. Label <- names it rests on
```

- **state**: `have` (I held it before the lesson), `done`, `now`, `todo`, `shaky`.
  Exactly one line is `now`.
- **name**: starting points get a letter (`a.`, `b.`), boxes get their number (`1.`,
  `2.`). The page shows the numbers and hides the letters.
- **Label**: plain words, six or fewer. No maths, no bold: this is a node in a diagram.
- **`<-`**: the names this box rests on, separated by commas. Give it on every box, and
  give all of them: a box resting on two things has two arrows. Starting points have none.

Write the same lines, in the same order, on every screen from the plan onwards. Only
the states change. The page shows the graph open on every screen, under a one-line
summary ("now: 2. … · 1 of 3 done"); I can fold it to that line, and it stays folded
until I open it again.

## Kinds of ask

| first line | what the page shows | what I type in the chat |
|---|---|---|
| `choice` + a list of options | the options lettered A, B, C, D in the order you wrote them, then "I don't know" as the next letter | a letter, often with a reason |
| `text` | "type your answer in your own words" | a sentence or two |
| `next` | "type n for the next step" | `n`, or a question |
| `approve` | "type ok to start, or say what to change" | `ok`, or a change |
| `none` | nothing. Use for the last screen | |

For `choice`: write the options without letters and without "I don't know"; the page
adds both. The page does **not** shuffle, so the first option is A. Decide which letter
is right before you write them, and spread it evenly over A to D across the lesson.

If I type something other than what the screen asked for, I am steering or asking a
question. Deal with it on the next screen, then return to where we were.

## Maths and pictures

- `$...$` inline, `$$...$$` on its own lines for display. Write real LaTeX: `\frac{a}{b}`, `\sqrt{n}`, `\le`.
- A relationship: a fenced `mermaid` block. Put every label in double quotes: `A["Counting outcomes"] --> B["Bell shape"]`.
- A shape, axis or plot: a complete `<svg viewBox="…">…</svg>` written by hand, at most
  640 wide, `font-family="sans-serif"`, strokes and text in `currentColor` so it works in dark mode.
- Something that varies: a simulation. Write the file as described in
  `references/sim.md`, then put a fenced `sim` block in the screen whose only line is
  its path, `learn/<lesson>/sims/<name>.html`. The page shows it live, at its own height.
- The map is not a picture you draw: write its lines in `## Map` and the page draws the graph.

## Without the page

If `lesson.html` is missing from this folder, or I say the page shows nothing, teach in
the chat: one question or step per message, about ten lines, plain-text maths
(`x^2`, `sqrt(n)`, `σ`), the map as an indented list. Use the chat format at the end
of `references/questions.md`. Say in one line that you switched.
