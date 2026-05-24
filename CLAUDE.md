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

## Working on logged-in pages

All site data is real production — there are no test accounts or throwaway cat entries.

### Inspecting page structure

1. User navigates to the target page in Chrome
2. Read the current tab's DOM with Claude-in-Chrome MCP (`get_page_text` / `read_page`)
3. Document discovered selectors and structure in `WORLD-KNOWLEDGE.md`
4. Implement locally; user reloads the unpacked extension at `chrome://extensions/` and tests manually

### Safety rules — non-negotiable

- **Never click anything on the live sites** via browser automation. Read-only tools only: `get_page_text`, `read_page`, `read_console_messages`.
- **Never navigate** to fdkat.dk / kissat.kissaliitto.fi / katt.nrr.no using browser tools. User controls all navigation.
- **Never submit any form** on the live sites.
- If a destructive element is visible (containing: delete, slet, fjern, remove, afmeld, or similar) — flag it explicitly and do nothing.