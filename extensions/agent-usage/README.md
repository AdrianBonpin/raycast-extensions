# Agent Usage

Track usage across your AI coding agents in one place.

![Agent Usage Screenshot](metadata/agent-usage-1.png)
![Agent Usage Screenshot](metadata/agent-usage-5.png)

## Features

- **Multi-Agent Support** - View usage for Amp Code, Claude Code, Codex (OpenAI), Droid (Factory AI), Gemini CLI, Kimi, Antigravity, Synthetic, and z.ai
- **Quick Overview** - See remaining quotas and usage at a glance
- **Detailed Breakdown** - Expand each agent for full usage details
- **Refresh & Copy** - Quickly refresh data or copy usage details to clipboard
- **Customizable** - Show/hide agents, reorder list, and configure display preferences
- **OpenCode Integration** - Auto-detect credentials from OpenCode for supported providers

## Supported Agents

| Agent           | Data Source               | Setup Required                            |
| --------------- | ------------------------- | ----------------------------------------- |
| **Amp**         | Local SQLite database     | None (auto-detected)                      |
| **Claude**      | Anthropic OAuth Usage API | None (auto-detected after `claude` login) |
| **Codex**       | OpenAI API                | None (auto-detected after `codex login`)  |
| **Droid**       | Factory AI API            | Authorization token                       |
| **Gemini**      | Local state file          | None (auto-detected)                      |
| **Kimi**        | Moonshot API              | None (auto-detected from OpenCode)        |
| **Antigravity** | Google API                | None (auto-detected)                      |
| **Synthetic**   | Synthetic API             | None (auto-detected from OpenCode)        |
| **z.ai**        | Z.AI API                  | None (auto-detected from OpenCode)        |

## Configuration

### Auto-Detection via OpenCode

The extension can automatically detect credentials from your OpenCode installation at `~/.local/share/opencode/auth.json`.

**Supported providers:**

- **Kimi** - Auto-detected if you use `kimi-for-coding` in OpenCode
- **Synthetic** - Auto-detected if you use `synthetic` in OpenCode
- **z.ai** - Auto-detected if you use `zai-coding-plan` in OpenCode

### Manual Setup

#### Kimi

**Option 1: OpenCode (Recommended)**

- Already configured if you use Kimi through OpenCode

**Option 2: Manual Token**

1. Go to https://www.kimi.com/code/console
2. Open browser DevTools (F12) → Network tab
3. Refresh the page and look for API requests
4. Copy the `Authorization` header value
5. Paste in Raycast extension preferences

#### Synthetic

**Option 1: OpenCode (Recommended)**

- Already configured if you use Synthetic through OpenCode

**Option 2: API Key**

1. Go to https://synthetic.new/billing
2. Click "API Keys" or "Create API Key"
3. Copy your API key (starts with `syn_...`)
4. Paste in Raycast extension preferences

#### Codex (Zero Config)

1. Run `codex login` in Terminal (if you are not already logged in)
2. Open Agent Usage in Raycast — Codex usage will be auto-detected from `~/.codex/auth.json`

Optional fallback:

- If auto-detection fails, you can still paste a token manually in extension preferences (`Codex Authorization Token`).

#### Droid Token

1. Open https://app.factory.ai/settings/billing in your browser
2. Open DevTools (F12) → Network tab
3. Refresh the page and find any API request
4. Copy the `Authorization` header value
5. Paste in extension preferences
6. Note that the token expiration time is approximately **6 hours**.

#### z.ai

**Option 1: OpenCode (Recommended)**

- Already configured if you use z.ai (`zai-coding-plan`) through OpenCode

**Option 2: API Key**

1. Get your API key from https://z.ai
2. Paste directly in Raycast extension preferences

## Preferences

- **Visible Agents** - Toggle which agents to show in the list
- **Amp Display Mode** - Show remaining as amount or percentage
- **Agent Order** - Use `⌘⌥↑` / `⌘⌥↓` to reorder agents in the list

## Keyboard Shortcuts

| Shortcut | Action             |
| -------- | ------------------ |
| `↵`      | Refresh usage data |
| `⌘C`     | Copy usage details |
| `⌘⌥↑`    | Move agent up      |
| `⌘⌥↓`    | Move agent down    |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Roadmap

More agents coming soon.

## License

MIT
