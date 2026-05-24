# World Knowledge

Facts discovered about the target sites' DOM structure, URL patterns, authentication, and behavior.
Update this file whenever you discover or correct something about the external systems.

## Target Sites

All three sites run the same underlying FIFe Nordic pedigree database system:

- https://fdkat.dk (also `www.fdkat.dk`) — Danish
- https://kissat.kissaliitto.fi (also `www.kissat.kissaliitto.fi`) — Finnish
- https://katt.nrr.no (also `www.katt.nrr.no`) — Norwegian

Both bare and `www.` variants serve the same content; the manifest must include both.

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

### Pedigree table (`#tabSukupuu`)

Selector: `table.sukupuu`

Structure: nested `<td rowspan="N">` cells, one per ancestor. Each cell contains a `<div>` with:

- Cat link: `<a href="perusnaytto_kissa.aspx?id=XXXXX">name</a>` — ID is the unique cat identifier
- Registration number: `<span id="..._lblRekisterinumero">`
- Titles: `<span id="..._lblTittelit">`
- Kennel prefix: `<span id="..._lblKasvattajanimiPrefix">`
- EMS code: `<span id="..._lblEMSKoodi">`
- Birth date: `<span id="..._lblSyntymaaika">`

Number of generations selectable (1–8) via `__doPostBack` links — triggers a page reload with new content.

The tab also shows inbreeding coefficient (`#cphContent_sukupuu_lblSukusiitosprosentti`)
and ALC (`#cphContent_sukupuu_lblSukukatokerroin`).

## Logged-In Pages

_Not yet explored. To be documented as features are developed._
