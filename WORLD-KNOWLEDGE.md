# World Knowledge

Facts discovered about the target sites' DOM structure, URL patterns, authentication, and behavior.
Update this file whenever you discover or correct something about the external systems.

## Target Sites

All three sites run the same underlying FIFe Nordic pedigree database system:

- https://fdkat.dk (also `www.fdkat.dk`) — Danish
- https://kissat.kissaliitto.fi (also `www.kissat.kissaliitto.fi`) — Finnish
- https://katt.nrr.no (also `www.katt.nrr.no`) — Norwegian

Both bare and `www.` variants serve the same content; the manifest must include both.

The three sites share the same backend and stylesheet — same theme, differing mainly in language
(and minor deviations like date format). A palette derived from one applies to all three.

### Site visual palette (public pages)

From `App_Themes/Default/Default.css` (fdkat.dk):

- **Font:** `'Helvetica Neue', Helvetica, Arial, sans-serif`, base **12px**, body text `#333`
- **Accent blue `#38A4FF`** — NOT the general link colour. Regular `a` colour is commented out
  (links inherit `#333`); `#38A4FF` only applies to `a:visited` / `a:active`. Use it sparingly,
  for interactive/active cues only — leaning on it makes a restyle louder than the real site.
- **Soft panel tints:** blue `#E6F0FA` / `#EFF6FF` / `#E0E5FF`; warm **peach** `#FFEFE7` / `#FFD2BF`
- **Borders / greys:** blue-grey border `#C1CBD5`; control fill `#F0F0F0`; grey text `#999`
- The site's overall character is muted grey text + soft blue/peach panel tints, not a bright accent.
- Logo: `pics/logo_fd.png` — black-and-white "FELIS DANICA" line-art sun emblem.

## Public Search Results Page

**URL:** `kissat.aspx` (fdkat.dk, kissaliitto.fi) or `/Katter/kissat` (nrr.no)
**Detection:** Presence of `table.table.table-condensed.table-hover`

**Table structure (5 columns):**

| Index | Content | Notes |
|-------|---------|-------|
| 0 | Registration number | Plain text |
| 1 | Name | Inside `<a>` link |
| 2 | Breed | Inside `<span>` |
| 3 | Date of birth | Format: DD-MM-YYYY or DD.MM.YYYY |
| 4 | Gender | Multi-language (see gender-utils.js) |

Table has `<tbody>` for data rows and `<tfoot>` for the summary row.

## Public Cat Details Page

**URL:** `perusnaytto_kissa.aspx?id=<catid>` (all three sites)

Example: `https://www.fdkat.dk/perusnaytto_kissa.aspx?id=214591`

There is also a redirect alias: `https://www.fdkat.dk/Pedigree?id=<catid>`
→ redirects to `perusnaytto_kissa.aspx?id=<catid>#Pedigree`

### Tab structure

Bootstrap tabs (`data-toggle="tab"`) with these IDs and href anchors:

| Tab label (Danish) | Anchor / panel ID | Notes |
|--------------------|-------------------|-------|
| Basisinformation | `#tabPerustiedot` | Basic cat info; uses plain `table.table` |
| Helbredsinformation | `#tabTerveystulokset` | Health tests; uses `table.table.table-condensed.table-hover` |
| Udstillingsresultater | `#tabNayttelytulokset` | Show results; uses `table.table.table-condensed.table-hover` |
| Afkom | `#tabJalkelaiset` | Offspring; uses `table.table.table-condensed.table-hover` |
| Stamtavle | `#tabSukupuu` | Pedigree; uses `table.sukupuu` |

All tab panels are present in the DOM on page load; tabs show/hide via Bootstrap JS.

### Page layout (cat details)

Two Bootstrap columns (unique on page, no IDs):

| Selector | Width (lg) | Notes |
|----------|-----------|-------|
| `div.col-lg-10` | ~975px | Main content: cat info, tabs, pedigree |
| `div.col-lg-2` | ~195px | Sidebar: Felis Danica ad/logo; also carries `hidden-xs hidden-sm hidden-md` |

The columns sit inside `div.row` inside `div.container`. Bootstrap sets `.container { width: 1170px }` (not `max-width`) on large viewports — overriding it requires setting an inline `width` (e.g. `97%`), not `max-width`, on the container element.

### Basic info tab (`#tabPerustiedot`)

Fields are ASP.NET label `<span>`s whose `id` ends in a stable suffix regardless of the full
`ctl00_cphContent_perustiedot_...` prefix — select with `[id$="_suffix"]`. Confirmed present on
the public page; likely also present (same suffixes) on the logged-in `/FDKat/` variant since
it's probably the same server control, though that hasn't been directly inspected.

| Suffix | Content | Notes |
|--------|---------|-------|
| `_lblNimi` | Full display name | e.g. "Nyx Mavra Chang" (stamnavn + individual name); also echoed in the page's `<h1>` alongside the reg number |
| `_cNimi` | Individual name only | e.g. "Mavra Chang" (no stamnavn/kennel prefix) |
| `_cMuutTittelit` | Titles ("Andre titler") | Free-text, empty until the cat has show titles; convention elsewhere on the site is titles-then-name |
| `_cRekisterinumero` | Stambogsnummer | Distinct from the pedigree tab's `lblRekisterinumero` (different field, no suffix collision) |
| `_cSukupuoli` | Køn | |
| `_cEMSKoodiString` | EMS kode | |
| `_cSyntymaaika` | Fødselsdato | |
| `_cRekisterointipvm` | Registreringsdato | |

Used by `buildPrintHeader()` in `content.js` to populate the print-only pedigree header (see
FEATURES.md → "Print stylesheet").

### Bootstrap's print reset (public pages)

The public site's own `@media print` stylesheet includes Bootstrap 3's standard print reset:

```
*, ::after, ::before { color: #000 !important; text-shadow: none !important; background: 0 0 !important; box-shadow: none !important; }
.table td, .table th { background-color: #fff !important; }
```

The universal `*` rule strips every element's background when printing — including our
duplicate-ancestor highlight colors — despite being `!important`, because our own print rule
uses a more specific selector (`table.sukupuu td`) which wins the cascade regardless of
`!important` vs `!important` source order. This is why the highlight color is stored in a CSS
custom property (`--kdb-highlight-bg`, set by `applyPedigreeColors()`) rather than a plain
inline `background-color`: a stylesheet rule can reassert a custom property with higher
specificity, but there's no way to reassert an arbitrary *inline* value from a stylesheet rule.

### Sponsor ad placements (cat details page)

Two separate ad slots, both ASP.NET controls with `id` containing `Advertisement`:

- `cphAdvertisement1_...` — the "hovedsponsorer for Felis Danica" banner (Agria, Royal Canin),
  in its own `.row` near the top of the page, sharing that row only with the site logo column
- `cphAdvertisement2_...` — the smaller sidebar ad inside `.col-lg-2`, which shares its `.row`
  with the main content column (`.col-lg-10`) — hiding that whole row would take the pedigree
  with it, so only the `.col-lg-2` column itself is hidden, not the row

`markPrintClutter()` in `content.js` hides each ad by its own closest column
(`[class*="col-"]`), not by row, to avoid that trap.

### Generation picker / direct-link box (`#tabSukupuu`)

Neither the generation-number list nor the "direct link to pedigree" textbox has a useful class
of its own:

- Generation picker: `<ul class="horizontalList">` inside two nested unclassed `<div>`s (the
  outer of the two also holds the "Generationer" label as a sibling `<div>`)
- Direct-link textbox: `input[type="text"]` inside an unclassed `<div>`, alone in `#tabSukupuu`
  (safe to select by type since no other text inputs live in that panel)

`markPrintClutter()` in `content.js` tags both with a runtime `.kdb-print-hide` class rather
than relying on structural CSS selectors, since the wrapper `<div>`s carry no stable identity.

### Pedigree table (`#tabSukupuu`)

Selector: `table.sukupuu`

Structure: nested `<td rowspan="N">` cells, one per ancestor. Each cell contains a `<div>` with:

- Cat link: `<a href="perusnaytto_kissa.aspx?id=XXXXX">name</a>` — ID is the unique cat identifier
- Registration number: `<span id="..._lblRekisterinumero">`
- Titles: `<span id="..._lblTittelit">`
- Kennel prefix: `<span id="..._lblKasvattajanimiPrefix">`
- EMS code: `<span id="..._lblEMSKoodi">`
- Birth date: `<span id="..._lblSyntymaaika">`

The table has `width: auto` (computed ~756px for a 4-gen pedigree in the default layout); `td` has `padding: 0px`.

Each `td` contains one outer `div` (`padding: 5px; height: 99%`) with three direct child `div`s:

```
td
└── div [padding:5px; height:99%]          ← td > div
    ├── div [margin-bottom:3%]              ← empty spacer (prefix area, often blank)
    │   └── div (empty)
    ├── div [margin-bottom:3%]              ← main content
    │   ├── div → span#lblTittelit         (e.g. "EC")
    │   ├── div → a (name link) + span#lblLopputittelit  (trailing title e.g. "DM")
    │   ├── div → span#lblRekisterinumero  (reg numbers, can be long)
    │   └── div → span#lblEMSKoodi        (right-aligned)
    └── div                                 ← birth date
        └── span#lblSyntymaaika
```

Result: minimum 5 display lines per cell even with no text wrapping.

Number of generations selectable (1–8) via `__doPostBack` links — triggers a page reload with new content.

The tab also shows inbreeding coefficient (`#cphContent_sukupuu_lblSukusiitosprosentti`)
and ALC (`#cphContent_sukupuu_lblSukukatokerroin`).

## Logged-In Pages

All logged-in pages live under the `/FDKat/` path prefix (fdkat.dk only; other sites not yet
investigated). The subsystem uses **Bootstrap 4** (not Bootstrap 3 as on the public side), so
tab, grid, and table class names may differ from the public pages.

### Known URL patterns (fdkat.dk)

| Page | URL pattern | Notes |
|------|-------------|-------|
| User profile / cat list | `/FDKat/perusnaytto_henkilo.aspx?id=<uid>&returnTab=<tab>` | Tabs: profile, membership, cat list |
| Logged-in cat details | `/FDKat/perusnaytto_kissa.aspx?id=<catid>` | Has pedigree tab; DOM differs from public version |
| Test mating | `/FDKat/test_mate.aspx?id=<catid>&returnTab=<encoded-url>` | Displays pedigree of projected kittens |

Example URLs:

- `https://fdkat.dk/FDKat/perusnaytto_henkilo.aspx?id=32342&returnTab=TabPerustiedot`
- `https://fdkat.dk/FDKat/perusnaytto_kissa.aspx?id=243262`
- `https://fdkat.dk/FDKat/test_mate.aspx?id=243262&returnTab=perusnaytto_kissa.aspx%3fid%3d243262&returnTab=TabSukupuu`

### DOM structure — `test_mate.aspx` (inspected)

The test-mating pedigree uses **the same `table.sukupuu` structure** as the public pedigree:

- Selector: `table.sukupuu` — present, exactly one per page
- Rows live inside `<tbody>` — `table.querySelectorAll('tbody tr')` returns 16 rows (4-gen)
- The table shows **two parent pedigrees side by side**: 30 total cells (15 + 15)
- All cells have valid cat ID links — no hypothetical/unregistered kitten cells at the root
- Cat ID links: `<a href="/FDKat/perusnaytto_kissa.aspx?id=XXXXX">` — the same
  `a[href*="perusnaytto_kissa.aspx"]` selector and `[?&]id=(\d+)` regex both match
- Span IDs: same as public page (`lblTittelit`, `lblLopputittelit`, `lblRekisterinumero`,
  `lblEMSKoodi`, `lblSyntymaaika`), plus `lblOtsikko` and `lblDNA` in the first cell
- Inbreeding coefficient and ALC labels: present (`[id*="Sukusiitos"]`, `[id*="Sukukato"]`)

The pedigree table sits directly in `div#content > div > div` — **no Bootstrap tab wrapping**.
The page uses Bootstrap 4.3.1 (not Bootstrap 3), so `.col-lg-2` / `.col-lg-10` do not exist;
`addWideViewToggle` gracefully skips (returns early) when those selectors are absent.

### DOM structure — `/FDKat/perusnaytto_kissa.aspx` (inspected)

The logged-in cat details page uses **ASP.NET AJAX TabContainer** (not Bootstrap tabs). The
tab system uses `ajax__tab_panel` / `ajax__tab_container` classes. All tab content is present
in the DOM at page load (not loaded lazily via AJAX).

- Pedigree table: `table.sukupuu` — same selector, same structure as public and test_mate pages
- Pedigree tab panel: `div.ajax__tab_panel#cphContent_TabContainer_TabSukupuu`
- Cat ID links in cells: `<a href="/FDKat/perusnaytto_kissa.aspx?id=XXXXX">` — matches
  `a[href*="perusnaytto_kissa.aspx"]` selector and `[?&]id=(\d+)` regex
- 30 cells (4-gen, 16 `<tbody>` rows) — same as test_mate layout
- No `.col-lg-2` / `.col-lg-10` — `addWideViewToggle` gracefully skips

**Result**: `initCatDetailsPage()` works unchanged on this page. A cat with no duplicate
ancestors correctly produces no toggle and no console log (returns early at `colorMap.size === 0`).
