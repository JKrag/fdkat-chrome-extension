const { DUPE_COLORS, allCoveredBy, computePedigreeColors } = require('../lib/pedigree-utils');

// Helpers — td is irrelevant to the pure logic
const cell = (catId, rowStart, rowEnd) => ({ catId, rowStart, rowEnd, td: null });

describe('allCoveredBy()', () => {
  test('single eCell inside single dCell', () => {
    expect(allCoveredBy([cell('E', 2, 4)], [cell('D', 0, 8)])).toBe(true);
  });

  test('eCell exactly matching dCell bounds', () => {
    expect(allCoveredBy([cell('E', 0, 4)], [cell('D', 0, 4)])).toBe(true);
  });

  test('eCell starting before dCell', () => {
    expect(allCoveredBy([cell('E', 0, 4)], [cell('D', 2, 8)])).toBe(false);
  });

  test('eCell ending after dCell', () => {
    expect(allCoveredBy([cell('E', 2, 6)], [cell('D', 0, 4)])).toBe(false);
  });

  test('all eCells covered by respective dCells', () => {
    const eCells = [cell('E', 0, 2), cell('E', 8, 10)];
    const dCells = [cell('D', 0, 4), cell('D', 8, 12)];
    expect(allCoveredBy(eCells, dCells)).toBe(true);
  });

  test('one eCell not covered by any dCell', () => {
    const eCells = [cell('E', 0, 2), cell('E', 6, 8)];
    const dCells = [cell('D', 0, 4), cell('D', 8, 12)];
    expect(allCoveredBy(eCells, dCells)).toBe(false);
  });

  test('eCell can be covered by any dCell, not necessarily the same index', () => {
    const eCells = [cell('E', 9, 10)];
    const dCells = [cell('D', 0, 4), cell('D', 8, 12)];
    expect(allCoveredBy(eCells, dCells)).toBe(true);
  });
});

describe('computePedigreeColors()', () => {
  test('returns empty map when no cats appear more than once', () => {
    const cellData = [cell('A', 0, 8), cell('B', 8, 16)];
    expect(computePedigreeColors(cellData).size).toBe(0);
  });

  test('colors a single duplicated cat', () => {
    const cellData = [cell('A', 0, 4), cell('A', 8, 12)];
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.size).toBe(1);
    expect(colorMap.get('A')).toBe(DUPE_COLORS[0]);
  });

  test('colors two independent duplicates with different colors', () => {
    const cellData = [
      cell('A', 0, 4), cell('A', 8, 12),
      cell('B', 4, 8), cell('B', 12, 16),
    ];
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.size).toBe(2);
    expect(colorMap.get('A')).toBe(DUPE_COLORS[0]);
    expect(colorMap.get('B')).toBe(DUPE_COLORS[1]);
  });

  test('suppresses ancestor whose occurrences are all within a shallower duplicate', () => {
    // A (rowspan 4) is grandfather on both sides
    // C (rowspan 2) is A's parent — both occurrences are inside A's row ranges
    const cellData = [
      cell('A', 0, 4), cell('A', 8, 12),  // duplicate grandfather
      cell('C', 0, 2), cell('C', 8, 10),  // C's occurrences both within A's ranges
    ];
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.has('A')).toBe(true);
    expect(colorMap.has('C')).toBe(false);
  });

  test('does not suppress ancestor with an independent occurrence outside any shallower duplicate', () => {
    // A is duplicate (rows 0–4 and 8–12)
    // C appears inside A AND independently at rows 12–14 (outside A's ranges)
    const cellData = [
      cell('A', 0, 4), cell('A', 8, 12),
      cell('C', 0, 2), cell('C', 12, 14),
    ];
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.has('A')).toBe(true);
    expect(colorMap.has('C')).toBe(true);
  });

  test('chain suppression: only root-cause duplicate colored', () => {
    // A (rowspan 4) explains C (rowspan 2), which explains D (rowspan 1)
    const cellData = [
      cell('A', 0, 4), cell('A', 8, 12),
      cell('C', 0, 2), cell('C', 8, 10),
      cell('D', 0, 1), cell('D', 8, 9),
    ];
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.has('A')).toBe(true);
    expect(colorMap.has('C')).toBe(false);
    expect(colorMap.has('D')).toBe(false);
    expect(colorMap.size).toBe(1);
  });

  test('colors wrap around DUPE_COLORS when more duplicates than palette entries', () => {
    const cellData = [];
    for (let i = 0; i < DUPE_COLORS.length + 1; i++) {
      // Each cat appears in two non-overlapping ranges far apart so none suppress each other
      cellData.push(cell(String(i), i * 2, i * 2 + 1));
      cellData.push(cell(String(i), 100 + i * 2, 100 + i * 2 + 1));
    }
    const colorMap = computePedigreeColors(cellData);
    expect(colorMap.size).toBe(DUPE_COLORS.length + 1);
    expect(colorMap.get(String(DUPE_COLORS.length))).toBe(DUPE_COLORS[0]); // wraps
  });
});
