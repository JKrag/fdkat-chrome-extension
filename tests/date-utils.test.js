const { parseDate, extractYear } = require('../lib/date-utils.js');

describe('parseDate()', () => {
  describe('DD-MM-YYYY format (dash separator)', () => {
    test('parses standard date correctly', () => {
      const date = parseDate('15-06-2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(date.getDate()).toBe(15);
    });

    test('parses date with single digit day', () => {
      const date = parseDate('5-06-2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(5);
    });

    test('parses date with single digit month', () => {
      const date = parseDate('15-6-2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
    });

    test('parses January date correctly', () => {
      const date = parseDate('01-01-2021');
      expect(date.getFullYear()).toBe(2021);
      expect(date.getMonth()).toBe(0); // January is month 0
      expect(date.getDate()).toBe(1);
    });

    test('parses December date correctly', () => {
      const date = parseDate('31-12-2019');
      expect(date.getFullYear()).toBe(2019);
      expect(date.getMonth()).toBe(11); // December is month 11
      expect(date.getDate()).toBe(31);
    });
  });

  describe('DD.MM.YYYY format (dot separator)', () => {
    test('parses standard date correctly', () => {
      const date = parseDate('15.06.2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
    });

    test('parses date with single digit day', () => {
      const date = parseDate('5.06.2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(5);
    });

    test('parses date with single digit month', () => {
      const date = parseDate('15.6.2020');
      expect(date.getFullYear()).toBe(2020);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('date comparison', () => {
    test('earlier date is less than later date', () => {
      const earlier = parseDate('01-01-2020');
      const later = parseDate('01-01-2021');
      expect(earlier < later).toBe(true);
    });

    test('same date compares equal', () => {
      const date1 = parseDate('15-06-2020');
      const date2 = parseDate('15.06.2020');
      expect(date1.getTime()).toBe(date2.getTime());
    });

    test('different months compare correctly', () => {
      const jan = parseDate('15-01-2020');
      const dec = parseDate('15-12-2020');
      expect(jan < dec).toBe(true);
    });
  });
});

describe('extractYear()', () => {
  describe('DD-MM-YYYY format', () => {
    test('extracts year from standard date', () => {
      expect(extractYear('15-06-2020')).toBe(2020);
    });

    test('extracts year from old date', () => {
      expect(extractYear('01-01-1995')).toBe(1995);
    });

    test('extracts year from recent date', () => {
      expect(extractYear('25-12-2025')).toBe(2025);
    });
  });

  describe('DD.MM.YYYY format', () => {
    test('extracts year from standard date', () => {
      expect(extractYear('15.06.2020')).toBe(2020);
    });

    test('extracts year from old date', () => {
      expect(extractYear('01.01.1995')).toBe(1995);
    });
  });

  describe('invalid formats', () => {
    test('returns null for incomplete date', () => {
      expect(extractYear('15-06')).toBe(null);
    });

    test('returns null for single value', () => {
      expect(extractYear('2020')).toBe(null);
    });

    test('returns null for empty string', () => {
      expect(extractYear('')).toBe(null);
    });
  });
});
