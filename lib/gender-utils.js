// Gender detection utilities for Nordic FIFe cat pedigree databases
// Supports Danish, Norwegian, Finnish, and English gender terms

const MALE_TERMS = ['m', 'male', 'han', 'hankat', 'hann', 'hannkatt', 'uros'];
const FEMALE_TERMS = ['f', 'female', 'hun', 'hunkat', 'hunn', 'hunnkatt', 'naaras'];

/**
 * Check if a gender term indicates male
 * @param {string} genderText - The gender text to check
 * @returns {boolean} True if male
 */
function isMale(genderText) {
  return MALE_TERMS.includes(genderText.toLowerCase());
}

/**
 * Check if a gender term indicates female
 * @param {string} genderText - The gender text to check
 * @returns {boolean} True if female
 */
function isFemale(genderText) {
  return FEMALE_TERMS.includes(genderText.toLowerCase());
}

// Export for Node.js testing while remaining compatible with browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MALE_TERMS, FEMALE_TERMS, isMale, isFemale };
}
