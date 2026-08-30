# Roadmap

## Completed ✅

- Sort search results by any column (reg number, name, breed, date of birth, gender)
- Filter search results by text, gender buttons, year, date range
- Group search results by birth year, breed, registry
- Top summary line mirroring the bottom cat/group count
- Fix bug: search result tooling (filters, group-by, count) incorrectly appearing on cat details page tabs
- Color-code duplicate ancestors in the pedigree tab on cat details pages
- Wide pedigree view toggle (hides sidebar, compacts cell padding) to reduce scrolling on deep pedigrees
- Color-coded duplicate ancestors on the test-mating pedigree view and logged-in cat details page (`/FDKat/perusnaytto_kissa.aspx`)
- Visual refresh: unified add-on toolbar and site-harmonized styling moved to a namespaced `styles.css`
- Print stylesheet for 4-generation pedigrees on the public cat details page

## In Progress

_Nothing currently in progress._

## Planned

### Public cat details pages

See [WORLD-KNOWLEDGE.md](WORLD-KNOWLEDGE.md) for tab/DOM structure.

- Sort/filter the show results and offspring tables (same approach as search results)
- Print stylesheet for 5–8 generation pedigrees (the 4-gen version, A4 landscape, is done — see
  FEATURES.md)
- **Compact pedigree view** — evolve the current on/off wide-view toggle into a multi-level slider
  that progressively trades information density for vertical compactness:
  - **Level 1** (current toggle): hide sidebar, expand table width, reduce outer `div` padding and
    `3%` spacer margins; also now merges leading titles/kennel prefix onto the name's line and
    EMS code onto the birth-date line (built for print, wired into wide view too)
  - **Level 2**: hide birth date and registration numbers
  - **Level 3**: show cat name only; full details appear in a hover tooltip

### Logged-in page features

- Sort/filter tables on individual cat pages (show results, kittens, etc.)

### Search page enhancements

- Hair length grouping (longhair/shorthair based on breed code)
- Country of origin grouping
- Localization of group-by UI labels (Danish, Norwegian, Finnish)

### Internal improvements

- Split `content.js` into `lib/search-results.js` and `lib/cat-details.js` once the cat-details section grows heavy enough to warrant it (likely around the time show/offspring table sorting is added)
