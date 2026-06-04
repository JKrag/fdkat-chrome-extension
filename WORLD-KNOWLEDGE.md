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

### Page layout (cat details)

Two Bootstrap columns (unique on page, no IDs):

| Selector | Width (lg) | Notes |
|----------|-----------|-------|
| `div.col-lg-10` | ~975px | Main content: cat info, tabs, pedigree |
| `div.col-lg-2` | ~195px | Sidebar: Felis Danica ad/logo; also carries `hidden-xs hidden-sm hidden-md` |

The columns sit inside `div.row` inside `div.container`. Bootstrap sets `.container { width: 1170px }` (not `max-width`) on large viewports — overriding it requires setting an inline `width` (e.g. `97%`), not `max-width`, on the container element.

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

_Not yet explored. To be documented as features are developed._
