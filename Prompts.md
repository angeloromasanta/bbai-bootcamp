# Prompts

The prompts from the bootcamp slides, one lab per heading. Copy a block and paste it
into your agent (Kiro CLI, Claude Code or Codex). Replace `[topic]` with your own.

## Lab 1: Create a tutorial page

In your `bootcamp` folder, start your agent (`kiro-cli`, `claude` or `codex`). Pick one
topic from a class this week that you only half understand, then ask:

```
Create a page that explains [topic] that is interactive
```

Open `index.html` in your browser.

## Lab 2: The same page, now with an AGENTS.md

Tell your agent:

```
Download AGENTS.md from https://github.com/angeloromasanta/bbai-bootcamp into this folder, then guide me through customizing it
```

Answer its questions: what you study, how you learn best, how you want answers. Then
clear the conversation:

```
/clear
```

Redo Lab 1:

```
Create a page that explains [topic] that is interactive
```

Open `index.html`. What changed from your Lab 1 page?

## Lab 3: Build a skill — weekly prep

Connect your calendar first (Claude: claude.ai → Settings → Connectors → Google
Calendar; Kiro or Codex: add the calendar server shown in class to your MCP file).
Check that it works. The agent asks before it reads: read the request, then approve.

```
What do I have scheduled next week?
```

Ask for the skill:

```
Create a new skill called weekly-prep that shows what I need to prepare for next week
```

Test it in a new session:

```
/weekly-prep
```

Rather not share your calendar? Connect Notion or GitHub and build the skill on that.

## Lab 4: Get the learn skill

Tell your agent:

```
Download the skill from https://github.com/angeloromasanta/bbai-bootcamp and install it
```

Once it is installed, start a new session, keep `lesson.html` open next to your
terminal, and type:

```
Teach me [topic]. I have 10 minutes
```
