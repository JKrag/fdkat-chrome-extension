const DUPE_COLORS = [
  '#fff3b0', '#ffdac1', '#b5ead7', '#e2b4bd',
  '#c7ceea', '#b5d5c5', '#f9c2c2', '#d4c5e2',
];

// Returns true if every occurrence in eCells falls within the row range of some cell in dCells.
function allCoveredBy(eCells, dCells) {
  return eCells.every(eCell =>
    dCells.some(dCell => dCell.rowStart <= eCell.rowStart && eCell.rowEnd <= dCell.rowEnd)
  );
}

// Given an array of { catId, rowStart, rowEnd } objects (one per pedigree cell),
// returns a Map of catId -> colour for cats that are root-cause duplicates.
// Ancestors whose duplication is fully explained by a closer duplicate are suppressed.
function computePedigreeColors(cellData) {
  const occurrences = new Map();
  cellData.forEach(cell => {
    if (!occurrences.has(cell.catId)) occurrences.set(cell.catId, []);
    occurrences.get(cell.catId).push(cell);
  });

  const dupEntries = [...occurrences.entries()].filter(([, cells]) => cells.length > 1);
  if (dupEntries.length === 0) return new Map();

  const suppressed = new Set();
  dupEntries.forEach(([eId, eCells]) => {
    const covered = dupEntries.some(([dId, dCells]) => dId !== eId && allCoveredBy(eCells, dCells));
    if (covered) suppressed.add(eId);
  });

  const colorMap = new Map();
  dupEntries
    .filter(([id]) => !suppressed.has(id))
    .forEach(([id], i) => colorMap.set(id, DUPE_COLORS[i % DUPE_COLORS.length]));

  return colorMap;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DUPE_COLORS, allCoveredBy, computePedigreeColors };
}
