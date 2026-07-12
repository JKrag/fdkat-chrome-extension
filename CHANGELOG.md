# Changelog

## [1.4.1] - 2026-07-12

### Fixed

- Gender row colouring (and the sorted-header highlight and group-header background) were not
  applied: the `--kdb-*` design tokens were scoped to the `.kdb-toolbar` panel, so `var()`
  references on table rows/headers — which live outside the panel — resolved to nothing.
  Tokens are now declared on `:root`.

## [1.4.0] - 2026-07-12

### Changed

- Visual refresh of all injected UI. The scattered controls on the search-results page
  (clear-filters button, group-by dropdown, colour toggle, per-column filters and the top
  summary line) are now grouped into a single cohesive add-on toolbar panel with a soft blue
  tint, a thin accent edge, and consistent typography drawn from the host site's own palette
  (`#EFF6FF` / `#C1CBD5` / `#38A4FF`, Helvetica/Arial 12px). The pedigree pages get the same
  treatment via a compact variant of the toolbar.
- The sorted-column highlight now uses the site's soft `#E6F0FA` with a restrained blue accent
  underline instead of the previous saturated `lightblue`.
- Gender row tint and gender filter buttons shifted from candy pink to a softer peach
  (`#ffe6d8`) to match the site's warm accent; buttons gained hover/focus feedback.
- A discreet "✦ enhanced by KissatDB add-ons" caption now appears in the toolbar corner
  (with a tooltip clarifying the whole page is enhanced, not just the toolbar).

### Internal

- All static styling moved out of inline JS assignments into a namespaced `styles.css`
  (`.kdb-*`) injected via the manifest; `content.js` now toggles classes instead of writing
  ~40 inline styles. `styles.css` added to the packaging script.

## [1.3.0] - 2026-06-05

### Added

- Pedigree duplicate highlighting now also activates on the test-mating page
  (`FDKat/test_mate.aspx`); the pedigree table structure is identical to the public page so
  the same coloring logic applies with no changes

## [1.2.1] - 2026-06-05

### Fixed

- Pedigree duplicate highlighting: two same-depth duplicates could mutually suppress each other, leaving neither highlighted. Suppression now only applies when the covering ancestor is strictly shallower (larger row span).

## [1.2.0] - 2026-06-04

### Added

- Wide pedigree view toggle on the Stamtavle tab: hides the right sidebar, expands the pedigree table to full window width, and compacts cell padding and spacer margins — significantly reducing vertical scrolling on deep (5–8 generation) pedigrees
- Both pedigree toggles (wide view and duplicate highlighting) now remember their state across generation changes and cat-to-cat navigation via localStorage

## [1.1.0] - 2026-05-24

### Fixed

- Search result tooling (filters, group-by, count) no longer appears on cat details page tabs (health, show results, offspring)
- Extension now activates on `www.` subdomains of all three sites (previously only matched bare domains)
- Extension now runs correctly on pages where `load` event had already fired before content script injection

### Added

- Pedigree duplicate ancestor highlighting: root-cause duplicates get a distinct pastel background colour; ancestors whose duplication is fully explained by a closer ancestor are suppressed
- Toggle above the pedigree table to show/hide highlighting

## [1.0.0] - 2026-05-24

### Added
- Sort search results by any column
- Filter by text, gender, year, date range
- Group results by birth year, birth date, breed, registry
- Top summary line mirroring the bottom cat/group count
- Testing infrastructure (Jest), ESLint, and CI pipeline (GitHub Actions)
