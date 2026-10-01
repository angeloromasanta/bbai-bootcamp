# BBAI AI Bootcamp kit

A folder you open with your AI agent: [Kiro CLI](https://kiro.dev) in our demos, and
it works the same in Claude Code and Codex. It turns the agent into a tutor: you say
what you want to understand, it finds what you already know, and teaches you one step
at a time on a page in your browser, with a simulation you can play with.

| | what it is |
|---|---|
| **`learn`** skill | the tutor. You say `teach me the normal distribution` |
| **`lesson.html`** | the page the lesson appears on. Keep it open next to the terminal |
| **`AGENTS.md`** | who you are and how you learn. The agent reads it in every session |
| **[`CHEATSHEET.md`](CHEATSHEET.md)** | the commands of the three tools side by side, and how to stop the permission prompts |

## 1. Get it

On the GitHub page, press the green **Code** button → **Download ZIP**, then unzip it.
You get a folder called `bbai-bootcamp-main`. Or, if you have git:

```
git clone https://github.com/angeloromasanta/bbai-bootcamp.git
```

The skill sits in hidden folders (`.kiro`, `.claude`, `.agents`), so you may not see
it in Finder or Explorer. It is there.

## 2. Set up

1. Open `AGENTS.md` in any editor and change the lines under **About me** until they
   are true for you.
2. Double-click `lesson.html`. It opens in your browser and says "No lesson on screen yet".
3. Put the browser on one half of your screen and a terminal on the other.
4. In the terminal, go into the folder and start the agent with a strong model:

```
cd bbai-bootcamp-main
kiro-cli
/model claude-sonnet-5
```

On Claude Code or Codex, type `claude` or `codex` instead of `kiro-cli`. Nothing else
changes: the kit carries the same skill for each tool.

## 3. Learn something

Pick a topic from class that you only half understand, and type:

```
teach me <your topic>. I have 20 minutes.
```

The lesson appears on the page. **You read on the page and answer in the terminal.**
It asks a few questions to find what you already know, draws a map from there to your
goal, then teaches one box of the map at a time, with a simulation and a check.

- **Answer "I don't know" when you don't know.** A lucky guess sends the lesson to the
  wrong place.
- **Predict before you touch the simulation.** Being wrong here is where the learning
  happens.
- **Steer it.** `slower`, `faster`, `skip this`, `another example`, `time's up` all work.
- **Don't trust it blindly.** Ask `are you sure? check that` whenever a fact matters.
- **Let it save.** When the agent asks to write a file, allow it for the session. It is
  writing in `learn/`. [The cheatsheet](CHEATSHEET.md#5-stop-the-permission-prompts)
  says how to stop the prompts.

Each lesson is saved in `learn/<your-topic>/`: your notes, every screen and the
simulations. `teach me <the same topic>` picks up where you stopped.

## 4. Build on it

The simulation from your lesson is a starting point for your own app:

```
turn the simulation into a full page: add a quiz with feedback and a second control for <…>
```

When something breaks: press F12, copy the red error, paste it in the chat, say `fix this`.

To change how it teaches, edit `SKILL.md` in your tool's folder (`.kiro/skills/learn/`
for Kiro) and start a new chat.

## Credits

`learn` follows the method of Amos Blomqvist's learning system
([github.com/amosblomqvist/learn](https://github.com/amosblomqvist/learn)), rewritten
to need only a chat, a browser and a folder. It shares no text or code with his
repository. Licence: MIT.
