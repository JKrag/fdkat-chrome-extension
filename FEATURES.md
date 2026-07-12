# Features

## Search Results Page

All features activate automatically when a search results table is detected on any of the three supported sites.

### Sorting

Click any column header to sort ascending; click again to sort descending.
Columns: Registration number, Name, Breed, Date of birth, Gender.

### Filtering

A filter row appears above the table with controls per column:

- **Registration / Name / Breed**: Text substring filter
- **Date of birth**: Date range (from / to) and year filter with operators (=, <, >)
- **Gender**: Toggle buttons for Male / Female (multi-language aware)

### Grouping

A "Group by" dropdown lets you group rows by:

- Birth year
- Birth date
- Breed
- Registry

Group headers show the group name and cat count. A summary line at both top and bottom shows total cats and group count.

### Visual

- All controls (clear-filters, group-by, per-column filters, colour toggle, summary) are
  grouped into a single cohesive add-on toolbar panel styled to harmonize with the host site
  (soft blue tint, thin accent edge, Helvetica/Arial 12px). A discreet "enhanced by KissatDB
  add-ons" caption sits in the toolbar corner.
- Rows are colored by gender (subtle background tint: blue for males, peach for females)
- The sorted column header is highlighted with a soft tint and a blue accent underline

## Cat Details Page

Features activate automatically on `perusnaytto_kissa.aspx` pages.

### Pedigree duplicate highlighting

Root-cause duplicate ancestors are highlighted with a distinct pastel background colour each, making inbreeding patterns immediately visible. "Trivial" duplicates — ancestors whose every occurrence is already explained by a closer duplicate — are suppressed to reduce noise. A toggle above the pedigree table lets you hide the highlighting for a cleaner view.

### Wide pedigree view

A "Wide pedigree view" checkbox above the pedigree table hides the right sidebar and expands the main column to full page width, while also compacting cell padding. This reduces vertical scrolling for deep pedigrees (5–8 generations), which can otherwise stretch to many screen heights.

## Test-Mating Page (logged in)

Features activate automatically on `FDKat/test_mate.aspx` pages.

### Pedigree duplicate highlighting

Same duplicate ancestor highlighting as on the public cat details page — root-cause duplicates
get a distinct pastel background colour, with trivial duplicates suppressed. Toggle above the
table to show/hide highlighting.
