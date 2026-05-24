# Chrome extension adding features to fdkat.dk, kissat.kissaliitto.fi and katt.nrr.no

This is a small Chrome extension that attempts to address some of the shortcomings of the pedigree database systems of the 3 nordic FIFe clubs in Finland, Norway and Denmark.
These 3 clubs currently use the same system, originally developed by the Finnish organization and licensed to the other 2 clubs.

Links:
- [fdkat.dk](https://fdkat.dk/kissat.aspx)
- [katt.nrr.no](https://katt.nrr.no/Katter/kissat)
- [kissat.kissaliitto.fi](https://kissat.kissaliitto.fi/kissat.aspx)

This extension is available in the Chrome Web Store, but you can also install it manually.

## Manual installation

1. Download the contents of this repository as a zip file and extract it to a folder on your computer.
2. Open your Chrome/chromium browser and go to the extensions page (chrome://extensions/).
3. Enable developer mode (top right corner).
4. Click "Load unpacked" (top left corner) and select the folder you extracted the zip file to.
5. The extension should now be installed and active.
6. Go to the pedigree database of your choice and enjoy the new features.

## Features

### Search page sorting

The main publicly accessible search page has rather advanced search features, but the results are always sorted by the cats name, which is not always very useful.

With this extension, the column headers become clickable, and will re-sort the results by that column. Clicking the same column again will reverse the sort order.

The currently sorted column is highlighted in grey. Sort order (increasing or decreasing) is indicated with arrows.

### Color-coded gender

Cats in the search results are now color-coded based on their gender:
- Male cats are highlighted with a light blue background
- Female cats are highlighted with a light pink background

This feature supports multiple languages across the three Nordic websites (Danish, Norwegian, and Finnish), making it easier to visually distinguish between male and female cats in the search results.

A checkbox is provided above the search results table to easily toggle the color coding on and off according to your preference.

### Live filtering

Column-specific filters are now available above each column in the search results table:

- **Standard text filters** for most columns allow you to filter content based on any text that appears in that column
- **Gender dropdown** specifically for the gender column, letting you easily filter for males, females, or all cats
- **Date range filter** for the birth date column, allowing filtering by date ranges with "From" and "To" fields

These column-specific filters give you more precise control over your search results and can be combined for advanced filtering. For example, you can filter for female cats born within a specific date range that have certain keywords in their name.

### Group by

A "Group by" dropdown above the search results lets you group cats by logical concepts, making patterns in large result sets much easier to spot. Groups are displayed as header rows within the table showing the group name and cat count. Sorting within a group is fully supported — clicking a column header sorts cats within each group independently.

Available groupings:

- **Birth date (litters)** — groups cats sharing the same date of birth, ideal for identifying litter mates in a breeder's catalogue
- **Birth year** — groups by year of birth, useful for spotting generational patterns across decades
- **Breed** — groups by breed, handy when a breeder has worked with multiple breeds over the years
- **Registry** — groups by registration type: *LO (Livre d'Origine)* (the standard registry used by all three Nordic clubs), *Experimental* (RX/REIX registrations), and *Other*

The footer shows the total number of groups alongside the cat count, and grouping composes correctly with all existing filters.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features. Suggestions welcome — open an issue on GitHub.
