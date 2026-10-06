# Cheatsheet: Codex · Claude Code · Kiro CLI

The three tools do the same things under different names. Find your tool's column.

1. [The terminal](#1-the-terminal)
2. [Inside the chat](#2-inside-the-chat)
3. [Same idea, different names](#3-same-idea-different-names)
4. [Finding the global folder](#4-finding-the-global-folder)
5. [Stop the permission prompts](#5-stop-the-permission-prompts)

## 1. The terminal

| command | what it does | on Windows |
|---|---|---|
| `pwd` | print where you are | same |
| `ls` | list what is here (`ls -a` also shows hidden names) | same, or `dir` (`ls -Force` for hidden) |
| `cd bootcamp` | go into a folder (`cd ..` goes up) | same |
| `mkdir bootcamp` | make a new folder | same |

**Tab** completes a name for you. **Up-arrow** brings back the last command.
**Ctrl+C** stops anything.

## 2. Inside the chat

Type `/` in any of them to see every command.

| to… | Codex | Claude Code | Kiro CLI |
|---|---|---|---|
| Start it in your folder | `codex` | `claude` | `kiro-cli` |
| Pick a model | `/model` | `/model` | `/model` |
| Start a fresh chat | `/new` | `/clear` | `/clear` |
| Squeeze a long chat | `/compact` | `/compact` | `/compact` |
| Go back a turn | `Esc Esc` | `/rewind` · `Esc Esc` | `/rewind` |
| See what it can see | `/status` | `/context` | `/context show` |
| See what you have used | `/status` | `/usage` | `/usage` |
| Write the rules file | `/init` | `/init` | write `AGENTS.md` yourself |
| Connected apps (MCP) | `/mcp` | `/mcp` | `/mcp` |
| Decide what it may do | `/permissions` | `/permissions` · `Shift+Tab` | `/tools` |
| Resume yesterday's chat | `/resume` | `/resume` | `/chat` |
| Leave | `/quit` | `/exit` | `/quit` |

**Esc** stops the agent mid-task. **Shift+Enter** makes a new line inside a prompt.

## 3. Same idea, different names

When a tutorial is written for another tool, translate with this table.

| what | Codex | Claude Code | Kiro CLI |
|---|---|---|---|
| Rules file · this project | `AGENTS.md` | `CLAUDE.md` | `AGENTS.md` or `.kiro/steering/` |
| Rules file · every project | `~/.codex/AGENTS.md` | `~/.claude/CLAUDE.md` | `~/.kiro/steering/` |
| Settings folder | `.codex/` | `.claude/` | `.kiro/` |
| Skills · this project | `.agents/skills/` | `.claude/skills/` | `.kiro/skills/` |
| Skills · every project | `~/.agents/skills/` | `~/.claude/skills/` | `~/.kiro/skills/` |
| MCP servers | `.codex/config.toml` | `.mcp.json` | `.kiro/settings/mcp.json` |

A path **without** `~` (`.kiro/skills/`) is inside the project you are working in and
only counts there. A path **with** `~` (`~/.kiro/skills/`) is the global one: it counts
in every project on your laptop.

## 4. Finding the global folder

`~` is your home folder, and a name that starts with a dot (`.kiro`) is hidden until
you ask to see it. The same works for `.claude`, `.codex` and `.agents`.

- **Mac:** `~/.kiro` is `/Users/<your-name>/.kiro`. In Finder, **Cmd + Shift + .**
  shows hidden folders; from the terminal, `open ~/.kiro`.
- **Windows:** `~/.kiro` is `C:\Users\<your-name>\.kiro`. In Explorer, **View → Show →
  Hidden items**; from the terminal, `explorer $HOME\.kiro`.

## 5. Stop the permission prompts

By default the agent asks before it writes a file or runs a command. You can switch
that off.

> **Read this first.** With prompts off, the agent runs every command and edits every
> file without asking, including deleting things. Do it in a practice folder like this
> kit, not in a folder with work you care about or with passwords in it.

### Kiro CLI

**This chat only.** Type this in Kiro and confirm the warning:

```
/tools trust-all
```

`/tools reset` takes it back.

**Always, in every project.** Kiro reads its rules from
`~/.kiro/settings/permissions.yaml`. You have to make the file yourself, in a normal
terminal and **not** inside the Kiro chat.

Mac:

```
mkdir -p ~/.kiro/settings
printf 'rules:\n  - capability: all\n    effect: allow\n' > ~/.kiro/settings/permissions.yaml
```

Windows PowerShell:

```
mkdir -Force $HOME\.kiro\settings
Set-Content $HOME\.kiro\settings\permissions.yaml "rules:`n  - capability: all`n    effect: allow"
```

The file then reads:

```yaml
rules:
  - capability: all
    effect: allow
```

### Claude Code

Start it with prompts off for one session:

```
claude --dangerously-skip-permissions
```

### Codex

Start it with prompts off for one session:

```
codex --yolo
```
