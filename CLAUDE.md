# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension that enhances the Nordic FIFe cat pedigree databases (fdkat.dk, kissat.kissaliitto.fi, katt.nrr.no) with sorting, filtering, and visual features for search results.

## Architecture

This is a **Manifest V3 Chrome extension** with a single content script architecture:

- `manifest.json` - Extension configuration; content script runs on all three Nordic FIFe sites
- `lib/gender-utils.js` - Gender detection utilities (loaded first)
- `lib/date-utils.js` - Date parsing utilities (loaded second)
- `sorter.js` - Main content script that handles all functionality (no background scripts or popups)

### How It Works

The content script (`sorter.js`) activates on page load and looks for the search results table (`table.table.table-condensed.table-hover`). If found, it:

1. Injects filter controls above the table (text inputs, gender toggle buttons, year filter)
2. Makes column headers clickable for sorting
3. Applies gender-based row coloring

### Key Data Structures

- `activeFilters` object - Tracks active filters per column index with filter type and parameters
- Filter types: `text`, `gender-buttons`, `date-range`, `year-filter`
- Each column has a custom sort function in `sortFunctions` array

### Multi-language Gender Support

Gender matching handles terms in Danish, Norwegian, Finnish, and English:
- Male: m, male, han, hankat, hann, hannkatt, uros
- Female: f, female, hun, hunkat, hunn, hunnkatt, naaras

## Development

### Commands

```bash
npm test              # Run Jest test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run package       # Create ZIP for Chrome Web Store
npm run setup:keys    # Guide for Chrome Web Store API credentials
```

### Manual Testing

Load the extension in Chrome developer mode:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
4. Navigate to one of the target sites to test

### Project Structure

```
lib/
  gender-utils.js   # Gender detection (isMale, isFemale) - testable
  date-utils.js     # Date parsing (parseDate, extractYear) - testable
tests/
  gender-utils.test.js
  date-utils.test.js
scripts/
  package.sh        # Chrome Web Store packaging
  setup-credentials.sh
.github/workflows/
  ci.yml            # GitHub Actions CI pipeline
```

### Target Sites

The extension only activates on:
- https://fdkat.dk/*
- https://kissat.kissaliitto.fi/*
- https://katt.nrr.no/*

### Table Structure Assumptions

The code assumes a specific table structure with 5 columns (indices 0-4):
- Column 0: Registration number
- Column 1: Name (contains `<a>` link)
- Column 2: Breed (contains `<span>`)
- Column 3: Date of birth (format: DD-MM-YYYY or DD.MM.YYYY)
- Column 4: Gender

The table has both `<tbody>` for data rows and `<tfoot>` for the summary row.
