// Date parsing utilities for Nordic FIFe cat pedigree databases
// Handles DD-MM-YYYY and DD.MM.YYYY date formats

/**
 * Parse a date string in DD-MM-YYYY or DD.MM.YYYY format
 * @param {string} dateStr - The date string to parse
 * @returns {Date} Parsed Date object
 */
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split(/[-.]/).map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Extract the year from a date string in DD-MM-YYYY or DD.MM.YYYY format
 * @param {string} dateStr - The date string to parse
 * @returns {number|null} The year, or null if invalid format
 */
function extractYear(dateStr) {
  const parts = dateStr.split(/[-.]/).map(Number);
  return parts.length === 3 ? parts[2] : null;
}

// Export for Node.js testing while remaining compatible with browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseDate, extractYear };
}
