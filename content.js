console.log('Sorter script loaded ... ');

let lastSortedColumn = -1;
let ascending = true;
let colorCodingEnabled = true; // Default to enabled
let activeFilters = {}; // Track active filters for each column

const GROUP_DEFINITIONS = [
  { value: 'none',      label: 'None' },
  {
    value: 'birthdate', label: 'Birth date (litters)',
    getKey:  row => row.cells[3]?.innerText.trim() || '',
    compare: (a, b) => parseDate(a.cells[3]?.innerText.trim() || '') - parseDate(b.cells[3]?.innerText.trim() || ''),
  },
  {
    value: 'birthyear', label: 'Birth year',
    getKey:  row => String(extractYear(row.cells[3]?.innerText.trim()) ?? 'Unknown'),
    compare: (a, b) => (extractYear(a.cells[3]?.innerText.trim()) ?? 0) - (extractYear(b.cells[3]?.innerText.trim()) ?? 0),
  },
  {
    value: 'breed', label: 'Breed',
    getKey:  row => row.cells[2]?.querySelector('span')?.innerText.trim() || '',
    compare: (a, b) => (a.cells[2]?.querySelector('span')?.innerText.trim() || '').localeCompare(b.cells[2]?.querySelector('span')?.innerText.trim() || ''),
  },
  {
    value: 'registry', label: 'Registry',
    getKey: row => {
      const reg = row.cells[0]?.innerText.trim() || '';
      if (/\bLO\b/.test(reg)) return 'LO (Livre d\'Origine)';
      if (/RX|REIX|RIEX/.test(reg)) return 'Experimental';
      return 'Other';
    },
    compare: (a, b) => {
      const order = { 'LO (Livre d\'Origine)': 0, 'Experimental': 1, 'Other': 2 };
      const def = GROUP_DEFINITIONS.find(d => d.value === 'registry');
      return (order[def.getKey(a)] ?? 3) - (order[def.getKey(b)] ?? 3);
    },
  },
];

let currentGrouping = 'none';

function init() {
  console.log('Page reloaded');

  if (window.location.pathname.includes('perusnaytto_kissa') ||
      window.location.pathname.includes('test_mate')) {
    initCatDetailsPage();
    return;
  }

  // Check if the table has been added
  const table = document.querySelector('table.table.table-condensed.table-hover');
  if (table) {
    console.log('Table found');
    const headers = table.querySelectorAll('th');

    // Build the unified add-on toolbar (controls + filters + summary) above the table
    buildSearchToolbar(table, headers);

    headers.forEach((header, index) => {
      header.classList.add('kdb-th');

      header.addEventListener('click', function () {
        headers.forEach((h) => h.classList.remove('kdb-th--sorted'));
        // Highlight the clicked header
        header.classList.add('kdb-th--sorted');
        if (lastSortedColumn === index) {
          ascending = !ascending;
        } else {
          ascending = true;
        }
        lastSortedColumn = index;
        sortTable(index, ascending);
      });
    });
    
    // Apply color coding to the cat rows based on gender
    if (colorCodingEnabled) {
      colorCodeCatsByGender();
    }
  } else {
    console.log('Table not found');
  }
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}

// Build the unified add-on toolbar: controls row + filter row + summary/caption foot.
function buildSearchToolbar(table, headers) {
  const toolbar = document.createElement('div');
  toolbar.className = 'kdb-toolbar';

  toolbar.appendChild(buildControlsRow());
  toolbar.appendChild(buildFilterRow(headers));
  toolbar.appendChild(buildToolbarFoot(table));

  table.parentNode.insertBefore(toolbar, table);
}

// Shared checkbox+label toggle. onChange receives (checked, inputElement).
function makeToggle(id, labelText, onChange) {
  const label = document.createElement('label');
  label.htmlFor = id;
  label.style.display = 'inline-flex';
  label.style.alignItems = 'center';
  label.style.gap = '5px';
  label.style.cursor = 'pointer';
  label.style.fontWeight = 'normal';
  label.style.marginBottom = '0';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;
  input.addEventListener('change', function () { onChange(this.checked, this); });

  label.appendChild(input);
  label.appendChild(document.createTextNode(' ' + labelText));
  return { label, input };
}

// The discreet add-on signature. The tooltip clarifies the whole page is enhanced,
// not only the toolbar box it sits in.
function buildCaption() {
  const cap = document.createElement('span');
  cap.className = 'kdb-caption';
  cap.textContent = '✦ enhanced by KissatDB add-ons';
  cap.title = 'Sorting, filtering, grouping and colour cues on this page are added by the ' +
    'KissatDB add-ons browser extension.';
  return cap;
}

// Top row: clear-filters button (left), group-by dropdown (centre), colour toggle (right).
function buildControlsRow() {
  const row = document.createElement('div');
  row.className = 'kdb-toolbar__row';

  // Clear filters (left)
  const clearButton = document.createElement('button');
  clearButton.type = 'button'; // Prevent form submission
  clearButton.className = 'kdb-btn';
  clearButton.textContent = 'Clear all filters';
  clearButton.addEventListener('click', clearAllFilters);

  // Group by (centre)
  const groupByDiv = document.createElement('div');
  groupByDiv.style.display = 'flex';
  groupByDiv.style.alignItems = 'center';
  groupByDiv.style.gap = '6px';

  const groupByLabel = document.createElement('label');
  groupByLabel.textContent = 'Group by:';
  groupByLabel.htmlFor = 'groupBySelect';
  groupByLabel.style.fontWeight = 'normal';
  groupByLabel.style.marginBottom = '0';

  const groupBySelect = document.createElement('select');
  groupBySelect.id = 'groupBySelect';
  groupBySelect.className = 'kdb-select';

  GROUP_DEFINITIONS.forEach(def => {
    const opt = document.createElement('option');
    opt.value = def.value;
    opt.textContent = def.label;
    groupBySelect.appendChild(opt);
  });

  groupBySelect.addEventListener('change', function () {
    currentGrouping = this.value;
    applyGrouping(true); // sort rows by group key when switching grouping
  });

  groupByDiv.appendChild(groupByLabel);
  groupByDiv.appendChild(groupBySelect);

  // Colour toggle (right)
  const { label: colorLabel, input: colorInput } = makeToggle(
    'colorToggle', 'Color code by gender',
    (checked) => {
      colorCodingEnabled = checked;
      if (colorCodingEnabled) { colorCodeCatsByGender(); } else { removeColorCoding(); }
    }
  );
  colorInput.checked = colorCodingEnabled;

  row.appendChild(clearButton);
  row.appendChild(groupByDiv);
  row.appendChild(colorLabel);
  return row;
}

// Middle row: one filter control per column. Returns the row element (caller appends it).
function buildFilterRow(headers) {
  const filterRow = document.createElement('div');
  filterRow.className = 'kdb-filter-row';

  headers.forEach((header, index) => {
    const field = document.createElement('div');
    field.className = 'kdb-field';

    // Header text for the field label (strip any sort arrow)
    const headerText = header.textContent.trim().replace(/[▲▼]/, '');

    const label = document.createElement('div');
    label.className = 'kdb-field__label';
    label.textContent = headerText;

    // Column 4 is gender - toggle buttons instead of a text field
    if (index === 4) {
      const genderGroup = document.createElement('div');
      genderGroup.className = 'kdb-gender-group';

      const maleButton = document.createElement('button');
      maleButton.textContent = '♂';
      maleButton.title = 'Show/hide males';
      maleButton.type = 'button';
      maleButton.className = 'kdb-btn kdb-btn--male';
      maleButton.dataset.active = 'true'; // Active by default

      const femaleButton = document.createElement('button');
      femaleButton.textContent = '♀';
      femaleButton.title = 'Show/hide females';
      femaleButton.type = 'button';
      femaleButton.className = 'kdb-btn kdb-btn--female';
      femaleButton.dataset.active = 'true'; // Active by default

      // Dim the button when its gender is toggled off
      const updateButtonState = (button) => {
        button.classList.toggle('kdb-btn--off', button.dataset.active !== 'true');
      };

      const onGenderClick = function () {
        this.dataset.active = this.dataset.active === 'true' ? 'false' : 'true';
        updateButtonState(this);
        updateGenderFilter(maleButton.dataset.active === 'true', femaleButton.dataset.active === 'true', index);
      };
      maleButton.addEventListener('click', onGenderClick);
      femaleButton.addEventListener('click', onGenderClick);

      genderGroup.appendChild(maleButton);
      genderGroup.appendChild(femaleButton);

      field.appendChild(label);
      field.appendChild(genderGroup);
      filterRow.appendChild(field);
      return;
    }

    // Column 3 is date - year input plus =/</> operator buttons
    if (index === 3) {
      const dateGroup = document.createElement('div');
      dateGroup.className = 'kdb-date-group';

      const yearInput = document.createElement('input');
      yearInput.type = 'number';
      yearInput.min = '1900';
      yearInput.max = new Date().getFullYear();
      yearInput.placeholder = 'Year';
      yearInput.className = 'kdb-input';

      const buttonsRow = document.createElement('div');
      buttonsRow.className = 'kdb-date-buttons';

      const makeOpButton = (symbol, title) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = symbol;
        btn.title = title;
        btn.className = 'kdb-btn';
        btn.dataset.active = 'false';
        return btn;
      };
      const exactButton = makeOpButton('=', 'Born in exact year');
      const beforeButton = makeOpButton('<', 'Born before year');
      const afterButton = makeOpButton('>', 'Born after year');

      buttonsRow.appendChild(exactButton);
      buttonsRow.appendChild(beforeButton);
      buttonsRow.appendChild(afterButton);

      dateGroup.appendChild(yearInput);
      dateGroup.appendChild(buttonsRow);

      const updateButtonState = (button, active) => {
        button.dataset.active = active ? 'true' : 'false';
        button.classList.toggle('kdb-btn--on', active);
      };

      const updateDateFilter = () => {
        const year = yearInput.value.trim();
        const exactActive = exactButton.dataset.active === 'true';
        const beforeActive = beforeButton.dataset.active === 'true';
        const afterActive = afterButton.dataset.active === 'true';

        if (!year && !exactActive && !beforeActive && !afterActive) {
          delete activeFilters[index];
          applyFilters();
          return;
        }

        activeFilters[index] = {
          type: 'year-filter',
          year: year,
          exact: exactActive,
          before: beforeActive,
          after: afterActive
        };
        applyFilters();
      };

      yearInput.addEventListener('input', updateDateFilter);

      // Operator buttons are mutually exclusive
      const handleButtonClick = (clickedButton, otherButtons) => {
        const wasActive = clickedButton.dataset.active === 'true';
        updateButtonState(clickedButton, !wasActive);
        if (!wasActive) {
          otherButtons.forEach(btn => updateButtonState(btn, false));
        }
        updateDateFilter();
      };

      exactButton.addEventListener('click', function () { handleButtonClick(this, [beforeButton, afterButton]); });
      beforeButton.addEventListener('click', function () { handleButtonClick(this, [exactButton, afterButton]); });
      afterButton.addEventListener('click', function () { handleButtonClick(this, [exactButton, beforeButton]); });

      field.appendChild(label);
      field.appendChild(dateGroup);
      filterRow.appendChild(field);
      return;
    }

    // All other columns: text substring filter
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'kdb-input';
    textInput.placeholder = 'Type to filter...';
    textInput.addEventListener('input', function () {
      const value = this.value.trim();
      if (value === '') {
        delete activeFilters[index];
      } else {
        activeFilters[index] = { type: 'text', value: value.toLowerCase() };
      }
      applyFilters();
    });

    field.appendChild(label);
    field.appendChild(textInput);
    filterRow.appendChild(field);
  });

  return filterRow;
}

// Function to update gender filter based on button states
function updateGenderFilter(showMales, showFemales, columnIndex) {
  // If both are active or both are inactive, remove the filter (show all)
  if ((showMales && showFemales) || (!showMales && !showFemales)) {
    delete activeFilters[columnIndex];
  } else {
    // Otherwise, add a filter for the selected gender
    activeFilters[columnIndex] = {
      type: 'gender-buttons',
      showMales: showMales,
      showFemales: showFemales
    };
  }
  
  // Apply the filters
  applyFilters();
}

// Function to apply all active filters
function applyFilters() {
  const table = document.querySelector('table.table.table-condensed.table-hover');
  const tbody = table.querySelector('tbody');
  const tfoot = table.querySelector('tfoot');
  
  // Get all data rows from tbody
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Get the summary row from tfoot
  const summaryRow = tfoot ? tfoot.querySelector('tr') : null;
  
  // Show all rows if no filters active
  if (Object.keys(activeFilters).length === 0) {
    rows.forEach(row => {
      if (!row.dataset.groupHeader) row.style.display = '';
    });

    // Reset summary row to show only total count if we have one
    if (summaryRow) {
      resetSummaryRow(summaryRow);
    }

    applyGrouping();
    return;
  }
  
  // Track visible rows count
  let visibleRowCount = 0;
  
  // Apply filters to each row
  rows.forEach((row) => {
    if (row.dataset.groupHeader) return;
    let showRow = true;
    
    // Check each active filter
    for (const [columnIndex, filter] of Object.entries(activeFilters)) {
      const cell = row.cells[columnIndex];
      
      // Skip if no cell for this column
      if (!cell) continue;
      
      // Get cell content
      const cellContent = cell.textContent.trim();
      
      // Apply filter based on type
      if (filter.type === 'text') {
        // Simple text filtering
        if (!cellContent.toLowerCase().includes(filter.value)) {
          showRow = false;
          break;
        }
      } 
      else if (filter.type === 'gender-buttons') {
        // Gender button filtering - uses isMale/isFemale from lib/gender-utils.js
        const genderText = cellContent.trim();
        const catIsMale = isMale(genderText);
        const catIsFemale = isFemale(genderText);

        if (!(filter.showMales && catIsMale) && !(filter.showFemales && catIsFemale)) {
          showRow = false;
          break;
        }
      }
      else if (filter.type === 'date-range') {
        // Date range filtering
        if (filter.from || filter.to) {
          // Parse the date
          const dateStr = cellContent;
          const parts = dateStr.split(/[-.]/).map(Number);
          
          // Only process if it looks like a valid date format
          if (parts.length === 3) {
            const [day, month, year] = parts;
            const cellDate = new Date(year, month - 1, day);
            
            // Check from date
            if (filter.from) {
              const fromParts = filter.from.split(/[-.]/).map(Number);
              if (fromParts.length === 3) {
                const [fDay, fMonth, fYear] = fromParts;
                const fromDate = new Date(fYear, fMonth - 1, fDay);
                
                if (cellDate < fromDate) {
                  showRow = false;
                  break;
                }
              }
            }
            
            // Check to date
            if (filter.to) {
              const toParts = filter.to.split(/[-.]/).map(Number);
              if (toParts.length === 3) {
                const [tDay, tMonth, tYear] = toParts;
                const toDate = new Date(tYear, tMonth - 1, tDay);
                
                if (cellDate > toDate) {
                  showRow = false;
                  break;
                }
              }
            }
          }
        }
      }
      else if (filter.type === 'year-filter') {
        // Year-based filtering
        if (!filter.year && !filter.exact && !filter.before && !filter.after) {
          continue; // Skip this filter if no criteria
        }
        
        // Parse the date from the cell
        const dateStr = cellContent;
        const parts = dateStr.split(/[-.]/).map(Number);
        
        // Only process if it looks like a valid date format
        if (parts.length === 3) {
          const year = parts[2];
          
          // If year is specified, check conditions
          if (filter.year) {
            const filterYear = parseInt(filter.year, 10);
            
            if (filter.exact && year !== filterYear) {
              showRow = false;
              break;
            }
            
            if (filter.before && year >= filterYear) {
              showRow = false;
              break;
            }
            
            if (filter.after && year <= filterYear) {
              showRow = false;
              break;
            }
          }
        }
      }
    }
    
    // Show or hide row based on filter results
    row.style.display = showRow ? '' : 'none';
    
    // Count visible rows
    if (showRow) {
      visibleRowCount++;
    }
  });
  
  // Always show summary row and update counts
  if (summaryRow) {
    const dataRowCount = rows.filter(r => !r.dataset.groupHeader).length;
    updateSummaryRowCounts(summaryRow, visibleRowCount, dataRowCount);
  }

  applyGrouping();
}

// Function to reset summary row to original state
function resetSummaryRow(summaryRow) {
  // Get the cell with the count (the one with colspan)
  const countCell = summaryRow.querySelector('td[colspan]');
  
  // If we've modified it before, it will have a data-original attribute
  if (countCell && countCell.hasAttribute('data-original')) {
    // Get the span element inside
    const span = countCell.querySelector('span');
    if (span) {
      span.textContent = countCell.getAttribute('data-original');
    }
  }
}

// Function to update summary row with filtered/total counts
function updateSummaryRowCounts(summaryRow, visibleCount, totalCount) {
  // Get the cell with the count (the one with colspan)
  const countCell = summaryRow.querySelector('td[colspan]');
  
  if (!countCell) return;
  
  // Get the span element with the count
  const span = countCell.querySelector('span');
  
  if (!span) return;
  
  // Store original text if we haven't already
  if (!countCell.hasAttribute('data-original')) {
    countCell.setAttribute('data-original', span.textContent);
  }
  
  // Get the original text
  const originalText = countCell.getAttribute('data-original');
  
  // Extract just the number suffix (e.g., "stk.", "kpl")
  const countSuffix = originalText.replace(/\d+/g, '').trim();
  
  // Update the text to show both filtered and total counts
  span.textContent = `${visibleCount} / ${totalCount} ${countSuffix}`;
}

// Function to remove color coding
function removeColorCoding() {
  const table = document.querySelector('table.table.table-condensed.table-hover');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  rows.forEach(row => {
    row.classList.remove('kdb-row--male', 'kdb-row--female');
  });
}

// Function to color code cats by gender
function colorCodeCatsByGender() {
  console.log('Applying color coding for cats by gender');

  // First remove any existing color coding
  removeColorCoding();

  // Only apply colors if the feature is enabled
  if (!colorCodingEnabled) return;

  const table = document.querySelector('table.table.table-condensed.table-hover');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  // Process all rows and check if the last one is a summary row
  rows.forEach((row, _index) => {
    // Check if this is a data row (has the gender cell with content)
    const genderCell = row.cells[4];
    if (genderCell && genderCell.innerText.trim()) {
      const genderText = genderCell.innerText.trim();

      // Apply a tint class based on gender - uses isMale/isFemale from lib/gender-utils.js
      if (isMale(genderText)) {
        row.classList.add('kdb-row--male');
      } else if (isFemale(genderText)) {
        row.classList.add('kdb-row--female');
      }
    }
  });
}

// Function to clear all filters while preserving sort order
function clearAllFilters() {
  // Clear the activeFilters object
  activeFilters = {};
  
  // Reset all filter input elements
  // Reset text inputs
  const textInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
  textInputs.forEach(input => {
    input.value = '';
  });
  
  // Reset toggle buttons
  const toggleButtons = document.querySelectorAll('button[data-active]');
  toggleButtons.forEach(button => {
    // Gender buttons (♂/♀) return to active
    if (button.textContent === '♂' || button.textContent === '♀') {
      button.dataset.active = 'true';
      button.classList.remove('kdb-btn--off');
    }
    // Date operator buttons (=, <, >) return to inactive
    else if (button.textContent === '=' || button.textContent === '<' || button.textContent === '>') {
      button.dataset.active = 'false';
      button.classList.remove('kdb-btn--on');
    }
  });
  
  // Show all rows and reset summary row count
  applyFilters();
}

// Function to apply group-by grouping to visible rows.
// Pass sortByKey=true when changing the grouping to first sort all rows by group key.
function applyGrouping(sortByKey = false) {
  const table = document.querySelector('table.table.table-condensed.table-hover');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  const tfoot = table.querySelector('tfoot');

  // Remove any existing group header rows
  tbody.querySelectorAll('tr[data-group-header]').forEach(r => r.remove());

  const summaryRow = tfoot ? tfoot.querySelector('tr') : null;

  if (currentGrouping === 'none') {
    updateGroupCount(summaryRow, null);
    syncTopSummary();
    return;
  }

  const def = GROUP_DEFINITIONS.find(d => d.value === currentGrouping);
  if (!def) return;

  // When switching grouping, re-order all data rows by the group key so groups are contiguous
  if (sortByKey && def.compare) {
    const allRows = [...tbody.querySelectorAll('tr')];
    // Identify the summary row by its colspan td, not by position
    const summaryIdx = allRows.findIndex(r => r.querySelector('td[colspan]'));
    const tbodySummary = summaryIdx !== -1 ? allRows.splice(summaryIdx, 1)[0] : null;
    allRows.sort(def.compare);
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    allRows.forEach(row => tbody.appendChild(row));
    if (tbodySummary) tbody.appendChild(tbodySummary);
  }

  // Collect visible data rows in DOM order, excluding summary rows (td with colspan)
  const rows = [...tbody.querySelectorAll('tr')].filter(r =>
    r.style.display !== 'none' && !r.querySelector('td[colspan]')
  );

  // Group consecutive rows by key
  const groups = [];
  let lastKey = null;
  for (const row of rows) {
    const key = def.getKey(row);
    if (key !== lastKey) {
      groups.push({ key, rows: [] });
      lastKey = key;
    }
    groups[groups.length - 1].rows.push(row);
  }

  // Insert a header row before the first row of each group
  for (const group of groups) {
    const headerRow = buildGroupHeaderRow(group.key, group.rows.length);
    tbody.insertBefore(headerRow, group.rows[0]);
  }

  updateGroupCount(summaryRow, groups.length);
  syncTopSummary();
}

// Bottom row of the toolbar: the mirrored summary count (left) and the add-on caption (right).
function buildToolbarFoot(table) {
  const foot = document.createElement('div');
  foot.className = 'kdb-toolbar__foot';

  const summary = document.createElement('div');
  summary.id = 'fdkat-top-summary';
  summary.className = 'kdb-summary';

  const tfoot = table.querySelector('tfoot');
  const countCell = tfoot ? tfoot.querySelector('td[colspan]') : null;
  const span = countCell ? countCell.querySelector('span') : null;
  summary.textContent = span ? span.textContent : '';

  foot.appendChild(summary);
  foot.appendChild(buildCaption());
  return foot;
}

function syncTopSummary() {
  const div = document.getElementById('fdkat-top-summary');
  if (!div) return;
  const table = document.querySelector('table.table.table-condensed.table-hover');
  const tfoot = table ? table.querySelector('tfoot') : null;
  const countCell = tfoot ? tfoot.querySelector('td[colspan]') : null;
  if (countCell) div.textContent = countCell.textContent.trim();
}

function buildGroupHeaderRow(key, count) {
  const tr = document.createElement('tr');
  tr.dataset.groupHeader = 'true';
  tr.className = 'kdb-group-header';

  const td = document.createElement('td');
  td.colSpan = 5;
  td.textContent = `${key}  (${count} ${count === 1 ? 'cat' : 'cats'})`;

  tr.appendChild(td);
  return tr;
}

function updateGroupCount(summaryRow, groupCount) {
  if (!summaryRow) return;
  const countCell = summaryRow.querySelector('td[colspan]');
  if (!countCell) return;

  let groupSpan = countCell.querySelector('#fdkat-group-count');

  if (groupCount === null) {
    if (groupSpan) groupSpan.remove();
    return;
  }

  if (!groupSpan) {
    groupSpan = document.createElement('span');
    groupSpan.id = 'fdkat-group-count';
    groupSpan.style.marginLeft = '8px';
    groupSpan.style.color = '#666';
    countCell.appendChild(groupSpan);
  }

  groupSpan.textContent = `| ${groupCount} ${groupCount === 1 ? 'group' : 'groups'}`;
}

// Custom sort function for column 0
function sortColumnREG(a, b) {
  const textA = a.innerText.trim();
  const textB = b.innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 1
function sortColumnName(a, b) {
  const textA = a.querySelector('a').innerText.trim();
  const textB = b.querySelector('a').innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 2
function sortColumnBreed(a, b) {
  const textA = a.querySelector('span').innerText.trim();
  const textB = b.querySelector('span').innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 3 (Date of Birth)
// Uses parseDate from lib/date-utils.js
function sortColumnDOB(a, b) {
  const dateA = parseDate(a.innerText);
  const dateB = parseDate(b.innerText);

  return dateA - dateB;
}

// Custom sort function for column 4
function sortColumnGender(a, b) {
  const textA = a.innerText.trim();
  const textB = b.innerText.trim();
  return textA.localeCompare(textB);
}

function sortTable(columnIndex, ascending) {
  console.log('Sort by column: ' + columnIndex);

  const table = document.querySelector('table.table.table-condensed.table-hover');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.dataset.groupHeader);

  const sortFunctions = [sortColumnREG, sortColumnName, sortColumnBreed, sortColumnDOB, sortColumnGender];
  const sorter = (rowA, rowB) => {
    const compare = sortFunctions[columnIndex](rowA.cells[columnIndex], rowB.cells[columnIndex]);
    return ascending ? compare : -compare;
  };

  // Remove the last row (summary row)
  const summaryRow = rows.pop();

  if (currentGrouping !== 'none') {
    // Sort within each group, keeping group order stable
    const def = GROUP_DEFINITIONS.find(d => d.value === currentGrouping);
    const groupOrder = [];
    const groupMap = new Map();
    for (const row of rows) {
      const key = def.getKey(row);
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groupOrder.push(key);
      }
      groupMap.get(key).push(row);
    }
    groupOrder.forEach(key => groupMap.get(key).sort(sorter));
    rows.length = 0;
    groupOrder.forEach(key => rows.push(...groupMap.get(key)));
  } else {
    rows.sort(sorter);
  }

  // Clear existing rows in tbody
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  // Append sorted rows to tbody
  rows.forEach((row) => tbody.appendChild(row));

  // Append the summary row back to the bottom
  tbody.appendChild(summaryRow);

  updateSortIndicator(columnIndex, ascending);
  applyGrouping();
}

// Function to update the sort indicator on the column header
function updateSortIndicator(columnIndex, ascending) {
  const headers = document.querySelectorAll('th');
  // First, remove any existing indicators from all headers
  headers.forEach(header => {
    header.innerHTML = header.innerHTML.replace(/ \u25B2|\u25BC/g, ''); // Removes existing arrows
  });

  // Then, add the indicator to the current header
  const currentHeader = headers[columnIndex];
  currentHeader.innerHTML += ascending ? ' \u25B2' : ' \u25BC'; // Adds an arrow up or down
  
  // Reapply color coding after sorting
  if (colorCodingEnabled) {
    colorCodeCatsByGender();
  }
}

// ── Cat details page ──────────────────────────────────────────────────────────

function initCatDetailsPage() {
  const pedigreeTable = document.querySelector('table.sukupuu');
  if (!pedigreeTable) return;

  buildPrintHeader(pedigreeTable);
  markPrintClutter();
  markPrintStatsForReorder(pedigreeTable);
  mergeEmsAndBirthdate(pedigreeTable);

  const { cellData, colorMap } = buildPedigreeColorMap(pedigreeTable);

  // Gather both toggles into a single compact toolbar above the pedigree
  const toolbar = document.createElement('div');
  toolbar.className = 'kdb-toolbar kdb-toolbar--compact';

  addWideViewToggle(pedigreeTable, toolbar);
  if (colorMap.size > 0) {
    addPedigreeToggle(pedigreeTable, colorMap, cellData, toolbar);
  }

  // Nothing to show (e.g. a layout without wide-view support and no duplicates)
  if (!toolbar.querySelector('input')) return;

  toolbar.appendChild(buildCaption());
  pedigreeTable.parentElement.insertBefore(toolbar, pedigreeTable);

  if (colorMap.size > 0) {
    console.log(`Pedigree: ${colorMap.size} root-cause duplicate(s) highlighted`);
  }
}

function buildPedigreeColorMap(table) {
  // DOM traversal — reconstruct table positions via rowspan tracking
  const rows = table.querySelectorAll('tbody tr');
  const colOccupied = {};
  const cellData = [];

  rows.forEach((tr, rowIdx) => {
    let col = 0;
    tr.querySelectorAll(':scope > td').forEach(td => {
      while ((colOccupied[col] || 0) > rowIdx) col++;
      const rowspan = parseInt(td.getAttribute('rowspan') || '1', 10);
      colOccupied[col] = rowIdx + rowspan;
      const link = td.querySelector('a[href*="perusnaytto_kissa.aspx"]');
      if (link) {
        const match = link.href.match(/[?&]id=(\d+)/);
        if (match) cellData.push({ catId: match[1], rowStart: rowIdx, rowEnd: rowIdx + rowspan, td });
      }
      col++;
    });
  });

  const colorMap = computePedigreeColors(cellData);
  return { cellData, colorMap };
}

function applyPedigreeColors(colorMap, cellData) {
  cellData.forEach(cell => { cell.td.style.setProperty('--kdb-highlight-bg', colorMap.get(cell.catId) || ''); });
}

function addWideViewToggle(table, toolbar) {
  const sidebar = document.querySelector('.col-lg-2');
  const mainCol = document.querySelector('.col-lg-10');
  if (!sidebar || !mainCol) return;

  const bootstrapContainer = sidebar.closest('.container');

  function applyWideView(wide) {
    if (bootstrapContainer) bootstrapContainer.style.width = wide ? '97%' : '';
    sidebar.style.display = wide ? 'none' : '';
    mainCol.style.width = wide ? '100%' : '';
    mainCol.style.maxWidth = wide ? '100%' : '';
    table.style.width = wide ? '100%' : '';
    table.classList.toggle('kdb-wide-pedigree', wide);
    document.querySelectorAll('table.sukupuu td > div').forEach(div => {
      div.style.padding = wide ? '2px' : '';
    });
    document.querySelectorAll('table.sukupuu td > div > div').forEach(div => {
      div.style.marginBottom = wide ? '0' : '';
    });
  }

  const { label, input } = makeToggle('pedigreeWideToggle', 'Wide pedigree view', (checked) => {
    localStorage.setItem('fdkat_wideView', checked);
    applyWideView(checked);
  });

  const saved = localStorage.getItem('fdkat_wideView') === 'true';
  if (saved) {
    input.checked = true;
    applyWideView(true);
  }

  toolbar.appendChild(label);
}

// Builds a print-only header (logo + name/titles + key fields) above the pedigree table.
// Reads from the Basisinformation tab's ASP.NET label spans; no-ops when that tab isn't
// present on the page (e.g. test_mate.aspx has no basic-info tab).
function buildPrintHeader(pedigreeTable) {
  const getField = (idSuffix) => {
    const el = document.querySelector(`[id$="${idSuffix}"]`);
    return el ? el.textContent.trim() : '';
  };

  const name = getField('_lblNimi');
  if (!name) return;

  const titles = getField('_cMuutTittelit');
  const fullName = titles ? `${titles} ${name}` : name;

  const fields = [
    ['Stambogsnr.', getField('_cRekisterinumero')],
    ['Køn', getField('_cSukupuoli')],
    ['EMS kode', getField('_cEMSKoodiString')],
    ['Født', getField('_cSyntymaaika')],
  ].filter(([, value]) => value);

  const header = document.createElement('div');
  header.className = 'kdb-print-header';

  const logo = document.querySelector('img[src*="logo_fd.png"]');
  if (logo) {
    const logoImg = document.createElement('img');
    logoImg.src = logo.src;
    logoImg.alt = 'Felis Danica';
    logoImg.className = 'kdb-print-header__logo';
    header.appendChild(logoImg);
  }

  const info = document.createElement('div');
  info.className = 'kdb-print-header__info';

  const nameEl = document.createElement('div');
  nameEl.className = 'kdb-print-header__name';
  nameEl.textContent = fullName;
  info.appendChild(nameEl);

  const fieldsEl = document.createElement('div');
  fieldsEl.className = 'kdb-print-header__fields';
  fieldsEl.textContent = fields.map(([label, value]) => `${label}: ${value}`).join('   |   ');
  info.appendChild(fieldsEl);

  header.appendChild(info);
  pedigreeTable.parentElement.insertBefore(header, pedigreeTable);
}

// Tags on-page controls that are only useful interactively (generation picker, direct-link
// copy box) with a print-hide class, since they have no stable CSS class of their own to
// target from styles.css.
function markPrintClutter() {
  const sukupuuPanel = document.getElementById('tabSukupuu');
  if (!sukupuuPanel) return;

  const genList = sukupuuPanel.querySelector('.horizontalList');
  if (genList && genList.parentElement && genList.parentElement.parentElement) {
    genList.parentElement.parentElement.classList.add('kdb-print-hide');
  }

  const directLinkInput = sukupuuPanel.querySelector('input[type="text"]');
  if (directLinkInput && directLinkInput.parentElement) {
    directLinkInput.parentElement.classList.add('kdb-print-hide');
  }

  // Sponsor banner ad (e.g. "hovedsponsorer for Felis Danica" / Agria / Royal Canin) — sits in
  // its own row above the cat heading, sharing that row only with the site logo. Hide just its
  // own column: the sidebar ad's column (.col-lg-2) shares a row with the main content column
  // and is already hidden via CSS, so hiding the whole row there would take the pedigree with it.
  document.querySelectorAll('[id*="Advertisement"]').forEach(ad => {
    const col = ad.closest('[class*="col-"]');
    if (col) col.classList.add('kdb-print-hide');
  });
}

// Tags the inbreeding coefficient / ALC lines and their shared container so the print
// stylesheet can flex-reorder them to appear after the pedigree table instead of before it.
function markPrintStatsForReorder(pedigreeTable) {
  const wrap = pedigreeTable.parentElement;
  if (!wrap) return;
  wrap.classList.add('kdb-print-pedigree-wrap');

  document.querySelectorAll('[id*="Sukusiitos"], [id*="Sukukato"]').forEach(span => {
    const statDiv = span.closest('div');
    if (statDiv) statDiv.classList.add('kdb-print-stats');
  });
}

// Moves each cell's EMS-code div (right-aligned, normally sitting above the birth date on its
// own line) inside the birth-date div, tagging the pair with a class that CSS can turn into a
// single flex row. Purely structural — with no flex rule applied it still renders as two stacked
// blocks, so this is safe to run unconditionally. CSS opts it into the merged layout for print
// and (via .kdb-wide-pedigree, set by addWideViewToggle) for the on-screen wide view.
function mergeEmsAndBirthdate(pedigreeTable) {
  pedigreeTable.querySelectorAll('[id*="lblSyntymaaika"]').forEach(birthSpan => {
    const birthDiv = birthSpan.parentElement;
    const cellRoot = birthDiv.parentElement;
    const emsSpan = cellRoot.querySelector('[id*="lblEMSKoodi"]');
    if (!emsSpan) return;
    birthDiv.classList.add('kdb-birthdate-ems-row');
    birthDiv.appendChild(emsSpan.parentElement);
  });
}

function addPedigreeToggle(table, colorMap, cellData, toolbar) {
  const { label, input } = makeToggle('pedigreeHighlightToggle', 'Highlight duplicate ancestors', (checked) => {
    localStorage.setItem('fdkat_highlightDupes', checked);
    if (checked) {
      applyPedigreeColors(colorMap, cellData);
    } else {
      cellData.forEach(cell => { cell.td.style.removeProperty('--kdb-highlight-bg'); });
    }
  });

  // Default is on; only off if the user has explicitly turned it off
  const saved = localStorage.getItem('fdkat_highlightDupes');
  input.checked = saved !== 'false';
  if (input.checked) {
    applyPedigreeColors(colorMap, cellData);
  }

  toolbar.appendChild(label);
}