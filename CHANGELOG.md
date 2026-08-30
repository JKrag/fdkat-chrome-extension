# Changelog

## [1.5.1] - 2026-08-29

### Added

- Print stylesheet for the public cat details page's pedigree tab. Printing (Ctrl/Cmd+P) while
  viewing the default 4-generation pedigree produces a clean, single-page A4 landscape printout:
  both sponsor ad placements, site nav/tabs/footer and the add-on's own toolbar controls are all
  hidden, and a print-only header is added with the Felis Danica logo, the cat's full name (with
  titles), stambogsnummer, køn, EMS kode and fødselsdato. Ancestor cells are laid out compactly —
  leading titles and kennel prefixes print inline with the name, and EMS code shares a line with
  birth date — the same compaction the on-screen "Wide pedigree view" toggle now also gets.
  Deeper pedigrees (5–8 generations) aren't tuned for print yet — planned separately. The
  duplicate-ancestor highlight colours (when that toggle is on) print too — the color is now
  carried in a CSS custom property (`--kdb-highlight-bg`) rather than a plain inline
  `background-color`, so a higher-specificity `!important` rule can win against Bootstrap's
  print stylesheet, which forces `background: 0 0 !important` on every element.
  (Squashes the 1.4.2–1.4.11 patch iteration below into this release.)

## [1.4.11] - 2026-08-29

### Added

- The last generation's ancestor cells were wasting a line per cell: the EMS code sat
  right-aligned on its own line above the birth date. The two are now merged onto one line —
  in the print stylesheet always, and in the on-screen "Wide pedigree view" toggle as well
  (the DOM pairing happens unconditionally in `content.js`; a `.kdb-wide-pedigree` class on the
  table, set by the toggle, is what turns on the merged layout on screen; print turns it on
  unconditionally since print always uses the full-width layout regardless of the toggle).

## [1.4.10] - 2026-08-29

### Fixed

- Print stylesheet: the kennel/breeder prefix (e.g. "Lancarrow", "DK Nyx") was still printing on
  its own line above the cat's name for many ancestors, not just the leading title as previously
  fixed — a block box nested inside an inline one still forces its own line break, so making the
  wrapper `display: inline` wasn't enough; the prefix `div` itself now gets it too. This is what
  was causing some cats' pedigrees to still spill across two pages.
- Print stylesheet no longer depends on whatever state the on-screen "Wide pedigree view" toggle
  was left in: that toggle sets padding/width via plain (non-`!important`) inline styles, and our
  print rules already override most of them with `!important`, but `table.sukupuu`'s own width
  wasn't pinned — it now always prints at full width regardless of the toggle.

## [1.4.9] - 2026-08-29

### Fixed

- Print stylesheet: the pedigree content was a little taller (~750px) than a landscape page's
  printable area (~700px at the old 12mm margin), so even with the ad/nav/footer/hr all hidden
  it still overflowed onto an otherwise-blank second page. Reduced the page margin to 8mm and
  trimmed the print header's logo/font sizing and spacing to buy back enough headroom to fit.

## [1.4.8] - 2026-08-29

### Fixed

- Print stylesheet: the `<hr>` separator that sat between the page content and the (now-hidden)
  footer was still spilling onto its own blank extra page. Hidden.

## [1.4.7] - 2026-08-29

### Fixed

- Print stylesheet: hid the site's `<footer>` ("2026 - Landsforeningen Felis Danica | MyCats"),
  which was wrapping onto its own second page even though the pedigree itself now fits on one.

## [1.4.6] - 2026-08-29

### Changed

- Print stylesheet: leading titles (CH, SC, etc.) now print inline with the cat's name instead
  of on their own line above it, saving a row of height per ancestor — this was pushing the ALC
  line onto a second page. Also dropped the underline print browsers add to links, since
  ancestor names no longer print as clickable URLs.

## [1.4.5] - 2026-08-29

### Changed

- Print stylesheet: hidden the "FDkat" site-name banner (`#title`) to reclaim vertical space for
  the pedigree, and moved the inbreeding coefficient / ALC lines to print after the pedigree
  table instead of before it (flex-reordered via a new `.kdb-print-pedigree-wrap` wrapper —
  on-screen order is unchanged).

## [1.4.4] - 2026-08-29

### Fixed

- Print stylesheet: switched to landscape orientation — portrait was narrow enough that long
  foreign registration numbers wrapped to a second line, roughly doubling the pedigree table's
  height and splitting it cleanly across two pages (Far tree / Mor tree) even after other fixes.
- Removed 85px of dead space at the top of the printout, left over from `.body-content`'s
  margin reserved for the now-hidden fixed navbar.
- Removed the raw URLs Bootstrap's print styles were appending after every ancestor link (e.g.
  "Name (perusnaytto_kissa.aspx?id=...)"), which was pure noise once the ad/nav chrome was gone.

## [1.4.3] - 2026-08-29

### Fixed

- Print stylesheet: a second sponsor banner ad (separate from the sidebar ad, sitting in its
  own row above the cat heading) was still printing, pushing the pedigree onto two pages. Now
  hidden. Also hid the fixed top nav bar and the redundant name/reg-number page heading (already
  shown in the print header), and fixed the pedigree tab rendering with `opacity: 0` when
  printed without first clicking into the Stamtavle tab (Bootstrap's `.fade` class).

## [1.4.2] - 2026-08-29

### Added

- Print stylesheet for the public cat details page's pedigree tab (4-generation only for now):
  hides the sidebar ad units, site tab navigation, other tab panels, and our own toolbar
  controls; expands the pedigree to full page width; and adds a print-only header with the
  Felis Danica logo, the cat's full name (with titles when present), stambogsnummer, køn, EMS
  kode and fødselsdato, pulled from the Basisinformation tab.

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
