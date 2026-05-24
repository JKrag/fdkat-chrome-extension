# World Knowledge

Facts discovered about the target sites' DOM structure, URL patterns, authentication, and behavior.
Update this file whenever you discover or correct something about the external systems.

## Target Sites

All three sites run the same underlying FIFe Nordic pedigree database system:

- https://fdkat.dk — Danish
- https://kissat.kissaliitto.fi — Finnish
- https://katt.nrr.no — Norwegian

## Public Search Results Page

**URL pattern:** Pages containing the search form, e.g. `/index.php?action=search` or similar  
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

## Logged-In Pages

_Not yet explored. To be documented as features are developed._
