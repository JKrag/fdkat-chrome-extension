const { MALE_TERMS, FEMALE_TERMS, isMale, isFemale } = require('../lib/gender-utils.js');

describe('Gender term constants', () => {
  test('MALE_TERMS and FEMALE_TERMS have no overlap', () => {
    const overlap = MALE_TERMS.filter(term => FEMALE_TERMS.includes(term));
    expect(overlap).toHaveLength(0);
  });

  test('MALE_TERMS contains expected terms', () => {
    expect(MALE_TERMS).toContain('m');
    expect(MALE_TERMS).toContain('male');
    expect(MALE_TERMS).toContain('han');
    expect(MALE_TERMS).toContain('hann');
    expect(MALE_TERMS).toContain('uros');
  });

  test('FEMALE_TERMS contains expected terms', () => {
    expect(FEMALE_TERMS).toContain('f');
    expect(FEMALE_TERMS).toContain('female');
    expect(FEMALE_TERMS).toContain('hun');
    expect(FEMALE_TERMS).toContain('hunn');
    expect(FEMALE_TERMS).toContain('naaras');
  });
});

describe('isMale()', () => {
  describe('English terms', () => {
    test('recognizes "m"', () => {
      expect(isMale('m')).toBe(true);
    });

    test('recognizes "male"', () => {
      expect(isMale('male')).toBe(true);
    });
  });

  describe('Danish terms', () => {
    test('recognizes "han"', () => {
      expect(isMale('han')).toBe(true);
    });

    test('recognizes "hankat"', () => {
      expect(isMale('hankat')).toBe(true);
    });
  });

  describe('Norwegian terms', () => {
    test('recognizes "hann"', () => {
      expect(isMale('hann')).toBe(true);
    });

    test('recognizes "hannkatt"', () => {
      expect(isMale('hannkatt')).toBe(true);
    });
  });

  describe('Finnish terms', () => {
    test('recognizes "uros"', () => {
      expect(isMale('uros')).toBe(true);
    });
  });

  describe('case insensitivity', () => {
    test('recognizes uppercase "M"', () => {
      expect(isMale('M')).toBe(true);
    });

    test('recognizes uppercase "MALE"', () => {
      expect(isMale('MALE')).toBe(true);
    });

    test('recognizes mixed case "Han"', () => {
      expect(isMale('Han')).toBe(true);
    });

    test('recognizes uppercase "UROS"', () => {
      expect(isMale('UROS')).toBe(true);
    });
  });

  describe('negative cases', () => {
    test('returns false for female terms', () => {
      expect(isMale('f')).toBe(false);
      expect(isMale('female')).toBe(false);
      expect(isMale('hun')).toBe(false);
      expect(isMale('naaras')).toBe(false);
    });

    test('returns false for unknown terms', () => {
      expect(isMale('unknown')).toBe(false);
      expect(isMale('')).toBe(false);
    });
  });
});

describe('isFemale()', () => {
  describe('English terms', () => {
    test('recognizes "f"', () => {
      expect(isFemale('f')).toBe(true);
    });

    test('recognizes "female"', () => {
      expect(isFemale('female')).toBe(true);
    });
  });

  describe('Danish terms', () => {
    test('recognizes "hun"', () => {
      expect(isFemale('hun')).toBe(true);
    });

    test('recognizes "hunkat"', () => {
      expect(isFemale('hunkat')).toBe(true);
    });
  });

  describe('Norwegian terms', () => {
    test('recognizes "hunn"', () => {
      expect(isFemale('hunn')).toBe(true);
    });

    test('recognizes "hunnkatt"', () => {
      expect(isFemale('hunnkatt')).toBe(true);
    });
  });

  describe('Finnish terms', () => {
    test('recognizes "naaras"', () => {
      expect(isFemale('naaras')).toBe(true);
    });
  });

  describe('case insensitivity', () => {
    test('recognizes uppercase "F"', () => {
      expect(isFemale('F')).toBe(true);
    });

    test('recognizes uppercase "FEMALE"', () => {
      expect(isFemale('FEMALE')).toBe(true);
    });

    test('recognizes mixed case "Hun"', () => {
      expect(isFemale('Hun')).toBe(true);
    });

    test('recognizes uppercase "NAARAS"', () => {
      expect(isFemale('NAARAS')).toBe(true);
    });
  });

  describe('negative cases', () => {
    test('returns false for male terms', () => {
      expect(isFemale('m')).toBe(false);
      expect(isFemale('male')).toBe(false);
      expect(isFemale('han')).toBe(false);
      expect(isFemale('uros')).toBe(false);
    });

    test('returns false for unknown terms', () => {
      expect(isFemale('unknown')).toBe(false);
      expect(isFemale('')).toBe(false);
    });
  });
});
