# Changelog

## [Unreleased]

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
