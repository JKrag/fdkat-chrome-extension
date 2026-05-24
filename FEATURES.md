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

- Rows are colored by gender (subtle background tint)

## Cat Details Page

Features activate automatically on `perusnaytto_kissa.aspx` pages.

### Pedigree duplicate highlighting

Root-cause duplicate ancestors are highlighted with a distinct pastel background colour each, making inbreeding patterns immediately visible. "Trivial" duplicates — ancestors whose every occurrence is already explained by a closer duplicate — are suppressed to reduce noise. A toggle above the pedigree table lets you hide the highlighting for a cleaner view.
