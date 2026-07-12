# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension that enhances the Nordic FIFe cat pedigree databases (fdkat.dk, kissat.kissaliitto.fi, katt.nrr.no).
See [FEATURES.md](FEATURES.md) for what's implemented and [ROADMAP.md](ROADMAP.md) for what's planned.

## Architecture

**Manifest V3** single content script — no background scripts, no popup.

- `manifest.json` — injects on all three Nordic FIFe site domains
- `lib/gender-utils.js` — `isMale()` / `isFemale()`, multi-language (loaded first)
- `lib/date-utils.js` — `parseDate()` / `extractYear()` (loaded second)
- `content.js` — main content script (~1100 lines); all runtime logic lives here

### How It Works

`content.js` runs at `document_idle`. It checks for the search results table selector; if present it injects filter controls, makes column headers sortable, and applies gender coloring. Key internal structures:

- `activeFilters` — tracks active filters per column index; types: `text`, `gender-buttons`, `date-range`, `year-filter`
- `sortFunctions[]` — one sort comparator per column
- `GROUP_DEFINITIONS[]` — grouping options (none / birthdate / birthyear / breed / registry)

For DOM selectors and page structure details, see [WORLD-KNOWLEDGE.md](WORLD-KNOWLEDGE.md).

## Development

Keep markdown files markdownlint-compliant.

When making changes that require a reload of the unpacked extension, update the version number in `manifest.json` (patch level) so I can verify that the new version is loaded. When we proceed to publishing a real new version, with feature(s) that are tested and solid, then we will make a real decision on appropriate semantic versioning increase.

**Always keep `manifest.json` and `package.json` version numbers in sync.** Both must be updated together whenever the version changes.

### Commands

```bash
npm test              # Run Jest test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run package       # Create ZIP for Chrome Web Store
```

### Manual Testing

1. `chrome://extensions/` → Enable "Developer mode" → "Load unpacked" → select this directory
2. Navigate to a target site and test

### Project Structure

```txt
lib/              # Utility modules (testable)
tests/            # Jest tests
scripts/          # Packaging and credential setup
.github/workflows/ci.yml
```

## Living documents — keep these up to date

When you make changes, update the relevant files before committing:

| File                | Update when                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| @ROADMAP.md         | An issue is completed (mark ✅) or a new one is scoped                                                                |
| @FEATURES.md        | A new feature is implemented or an existing one is updated                                                            |
| @CHANGELOG.md       | We finish a feature, or relevant architecture change.                                                                 |
| @WORLD-KNOWLEDGE.md | You discover or correct a fact about an external system (URL format, auth requirements, field structure, dom details) |

Remember to consult these documents as needed before starting work on new features, to ensure your changes align with the overall project direction and to avoid duplicating efforts.

## Working on live sites

All site data is real production — there are no test accounts or throwaway cat entries.

### Inspecting page structure

1. User navigates to the target page in Chrome
2. Read the current tab's DOM with Claude-in-Chrome MCP (`get_page_text` / `read_page` / `javascript_tool`)
3. Document discovered selectors and structure in `WORLD-KNOWLEDGE.md`
4. Implement locally; user reloads the unpacked extension at `chrome://extensions/` and tests manually

### Safety rules — tiered by page type

The key distinction is whether the URL contains `/FDKat/` in the path.

#### Public pages (no `/FDKat/` in path)

Includes: search results (`kissat.aspx`), public cat details (`perusnaytto_kissa.aspx` without
`/FDKat/`), and the smart redirect (`/Pedigree?id=...`).

- All Claude-in-Chrome tools are allowed: `navigate`, `read_page`, `get_page_text`, `find`,
  `javascript_tool`, `read_console_messages`
- Clicking read-only UI is fine: tabs, generation selectors, toggles added by this extension
- Never submit any form or click anything that could write data

#### Logged-in pages (`/FDKat/` anywhere in the URL path) — non-negotiable

- **Read-only tools only**: `get_page_text`, `read_page`, `read_console_messages`, and `javascript_tool` for pure DOM inspection (no mutations — no `setAttribute`, `style`, `innerHTML =`, `click()`, `submit()`, etc.)
- **Never navigate** to a logged-in page using browser tools. User controls all navigation.
- **Never click anything** on logged-in pages via browser automation.
- **Never submit any form** on logged-in pages.
- If a destructive element is visible (containing: delete, slet, fjern, remove, afmeld, or
  similar) — flag it explicitly and do nothing.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->