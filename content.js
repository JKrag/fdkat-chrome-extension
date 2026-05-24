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

  if (window.location.pathname.includes('perusnaytto_kissa')) {
    initCatDetailsPage();
    return;
  }

  // Check if the table has been added
  const table = document.querySelector('table.table.table-condensed.table-hover');
  if (table) {
    console.log('Table found');
    const headers = table.querySelectorAll('th');

    // Add color toggle control above the table
    addColorToggle(table);
    
    // Add column filters to the table
    addColumnFilters(table, headers);

    // Add a summary line above the table mirroring the one at the bottom
    addTopSummary(table);

    headers.forEach((header, index) => {
      header.style.textDecoration = 'underline';

      header.addEventListener('click', function () {
        headers.forEach((header) => header.style.backgroundColor = '');
        // Highlight the clicked header
        header.style.backgroundColor = 'lightblue';
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

// Function to add the color toggle control
function addColorToggle(table) {
  // Create a container for the controls
  const controlsContainer = document.createElement('div');
  controlsContainer.style.marginBottom = '10px';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.justifyContent = 'space-between';
  
  // Create a div for the clear filters button (left side)
  const clearFiltersDiv = document.createElement('div');
  
  // Create the clear filters button
  const clearFiltersButton = document.createElement('button');
  clearFiltersButton.type = 'button'; // Prevent form submission
  clearFiltersButton.textContent = 'Clear All Filters';
  clearFiltersButton.style.padding = '4px 8px';
  clearFiltersButton.style.border = '1px solid #ccc';
  clearFiltersButton.style.borderRadius = '3px';
  clearFiltersButton.style.backgroundColor = '#f0f0f0';
  clearFiltersButton.style.cursor = 'pointer';
  
  // Add event listener for clear filters button
  clearFiltersButton.addEventListener('click', function() {
    clearAllFilters();
  });
  
  // Add button to container
  clearFiltersDiv.appendChild(clearFiltersButton);
  
  // Create a div for the color toggle (right side)
  const toggleDiv = document.createElement('div');
  toggleDiv.style.textAlign = 'right';
  
  // Create the checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'colorToggle';
  checkbox.checked = colorCodingEnabled;
  
  // Create the label
  const label = document.createElement('label');
  label.htmlFor = 'colorToggle';
  label.textContent = 'Color code by gender';
  label.style.marginLeft = '5px';
  label.style.fontWeight = 'normal';
  
  // Add event listener to toggle color coding
  checkbox.addEventListener('change', function() {
    colorCodingEnabled = this.checked;
    if (colorCodingEnabled) {
      colorCodeCatsByGender();
    } else {
      removeColorCoding();
    }
  });
  
  // Assemble the toggle control
  toggleDiv.appendChild(checkbox);
  toggleDiv.appendChild(label);
  
  // Create a "Group by" dropdown (center)
  const groupByDiv = document.createElement('div');
  groupByDiv.style.display = 'flex';
  groupByDiv.style.alignItems = 'center';
  groupByDiv.style.gap = '6px';

  const groupByLabel = document.createElement('label');
  groupByLabel.textContent = 'Group by:';
  groupByLabel.style.fontSize = '12px';
  groupByLabel.style.fontWeight = 'normal';

  const groupBySelect = document.createElement('select');
  groupBySelect.id = 'groupBySelect';
  groupBySelect.style.padding = '3px 5px';
  groupBySelect.style.border = '1px solid #ccc';
  groupBySelect.style.borderRadius = '3px';
  groupBySelect.style.backgroundColor = '#f0f0f0';
  groupBySelect.style.fontSize = '12px';
  groupBySelect.style.cursor = 'pointer';

  GROUP_DEFINITIONS.forEach(def => {
    const opt = document.createElement('option');
    opt.value = def.value;
    opt.textContent = def.label;
    groupBySelect.appendChild(opt);
  });

  groupBySelect.addEventListener('change', function() {
    currentGrouping = this.value;
    applyGrouping(true); // sort rows by group key when switching grouping
  });

  groupByDiv.appendChild(groupByLabel);
  groupByDiv.appendChild(groupBySelect);

  // Add both controls to the container
  controlsContainer.appendChild(clearFiltersDiv);
  controlsContainer.appendChild(groupByDiv);
  controlsContainer.appendChild(toggleDiv);
  
  // Insert the controls before the table
  table.parentNode.insertBefore(controlsContainer, table);
}

// Function to add column-specific filters
function addColumnFilters(table, headers) {
  // Create a container for all filter inputs
  const filterRow = document.createElement('div');
  filterRow.style.display = 'flex';
  filterRow.style.marginBottom = '15px';
  filterRow.style.marginTop = '10px';
  filterRow.style.alignItems = 'flex-end';
  
  // Get column widths to match filters to columns
  const columnWidths = Array.from(headers).map(header => {
    return Math.max(100, header.offsetWidth - 10) + 'px'; // Minimum width 100px
  });
  
  // Create filter inputs for each column
  headers.forEach((header, index) => {
    const filterContainer = document.createElement('div');
    filterContainer.style.flex = '1';
    filterContainer.style.padding = '0 5px';
    filterContainer.style.maxWidth = columnWidths[index];
    
    // Get header text for label
    const headerText = header.textContent.trim().replace(/[▲▼]/, '');
    
    // Create label
    const label = document.createElement('div');
    label.textContent = 'Filter: ' + headerText;
    label.style.fontSize = '12px';
    label.style.marginBottom = '3px';
    
    // Create filter based on column type
    let filterInput;
    
    // Column 4 is gender - create toggle buttons instead of dropdown
    if (index === 4) {
      filterInput = document.createElement('div');
      filterInput.style.display = 'flex';
      filterInput.style.gap = '5px';
      
      // Male toggle button
      const maleButton = document.createElement('button');
      maleButton.textContent = '♂';
      maleButton.title = 'Show/hide males';
      maleButton.type = 'button'; // Prevent form submission
      maleButton.style.flex = '1';
      maleButton.style.backgroundColor = '#d4e6ff'; // Light blue
      maleButton.style.border = '1px solid #9ab8e6';
      maleButton.style.borderRadius = '3px';
      maleButton.style.padding = '3px 5px';
      maleButton.style.cursor = 'pointer';
      maleButton.dataset.active = 'true'; // Active by default
      
      // Female toggle button
      const femaleButton = document.createElement('button');
      femaleButton.textContent = '♀';
      femaleButton.title = 'Show/hide females';
      femaleButton.type = 'button'; // Prevent form submission
      femaleButton.style.flex = '1';
      femaleButton.style.backgroundColor = '#ffd4e6'; // Light pink
      femaleButton.style.border = '1px solid #e6b1c9';
      femaleButton.style.borderRadius = '3px';
      femaleButton.style.padding = '3px 5px';
      femaleButton.style.cursor = 'pointer';
      femaleButton.dataset.active = 'true'; // Active by default
      
      // Function to update button appearance based on state
      const updateButtonState = (button) => {
        const isActive = button.dataset.active === 'true';
        button.style.opacity = isActive ? '1' : '0.5';
        button.style.fontWeight = isActive ? 'bold' : 'normal';
      };
      
      // Initialize button states
      updateButtonState(maleButton);
      updateButtonState(femaleButton);
      
      // Add event listeners for toggle buttons
      maleButton.addEventListener('click', function() {
        // Toggle active state
        this.dataset.active = this.dataset.active === 'true' ? 'false' : 'true';
        updateButtonState(this);
        
        // Update filter
        updateGenderFilter(maleButton.dataset.active === 'true', femaleButton.dataset.active === 'true', index);
      });
      
      femaleButton.addEventListener('click', function() {
        // Toggle active state
        this.dataset.active = this.dataset.active === 'true' ? 'false' : 'true';
        updateButtonState(this);
        
        // Update filter
        updateGenderFilter(maleButton.dataset.active === 'true', femaleButton.dataset.active === 'true', index);
      });
      
      // Add buttons to container
      filterInput.appendChild(maleButton);
      filterInput.appendChild(femaleButton);
    } 
    // Column 3 is date - add special date filter
    else if (index === 3) {
      // Create a container for date range
      filterInput = document.createElement('div');
      filterInput.style.display = 'flex';
      filterInput.style.flexDirection = 'column';
      filterInput.style.gap = '3px';
      
      // Year input with clear button
      const yearRow = document.createElement('div');
      yearRow.style.display = 'flex';
      yearRow.style.gap = '3px';
      yearRow.style.marginBottom = '3px';
      
      // Year input
      const yearInput = document.createElement('input');
      yearInput.type = 'number';
      yearInput.min = '1900';
      yearInput.max = new Date().getFullYear(); // Current year
      yearInput.placeholder = 'Year';
      yearInput.style.flex = '1';
      yearInput.style.padding = '3px';
      yearInput.style.fontSize = '12px';
      
      // Add year input to row
      yearRow.appendChild(yearInput);
      
      // Date filter buttons
      const buttonsRow = document.createElement('div');
      buttonsRow.style.display = 'flex';
      buttonsRow.style.gap = '3px';
      
      // Create filter mode buttons
      const exactButton = document.createElement('button');
      exactButton.type = 'button';
      exactButton.textContent = '=';
      exactButton.title = 'Born in exact year';
      exactButton.style.flex = '1';
      exactButton.style.fontSize = '12px';
      exactButton.style.padding = '2px';
      exactButton.style.backgroundColor = '#f0f0f0';
      exactButton.style.border = '1px solid #ccc';
      exactButton.style.borderRadius = '3px';
      exactButton.style.cursor = 'pointer';
      exactButton.dataset.active = 'false';
      
      const beforeButton = document.createElement('button');
      beforeButton.type = 'button';
      beforeButton.textContent = '<';
      beforeButton.title = 'Born before year';
      beforeButton.style.flex = '1';
      beforeButton.style.fontSize = '12px';
      beforeButton.style.padding = '2px';
      beforeButton.style.backgroundColor = '#f0f0f0';
      beforeButton.style.border = '1px solid #ccc';
      beforeButton.style.borderRadius = '3px';
      beforeButton.style.cursor = 'pointer';
      beforeButton.dataset.active = 'false';
      
      const afterButton = document.createElement('button');
      afterButton.type = 'button';
      afterButton.textContent = '>';
      afterButton.title = 'Born after year';
      afterButton.style.flex = '1';
      afterButton.style.fontSize = '12px';
      afterButton.style.padding = '2px';
      afterButton.style.backgroundColor = '#f0f0f0';
      afterButton.style.border = '1px solid #ccc';
      afterButton.style.borderRadius = '3px';
      afterButton.style.cursor = 'pointer';
      afterButton.dataset.active = 'false';
      
      // Add buttons to row
      buttonsRow.appendChild(exactButton);
      buttonsRow.appendChild(beforeButton);
      buttonsRow.appendChild(afterButton);
      
      // Add rows to filter input
      filterInput.appendChild(yearRow);
      filterInput.appendChild(buttonsRow);
      
      // Function to update button appearance based on state
      const updateButtonState = (button, active) => {
        button.dataset.active = active ? 'true' : 'false';
        button.style.backgroundColor = active ? '#d0d0ff' : '#f0f0f0';
        button.style.fontWeight = active ? 'bold' : 'normal';
      };
      
      // Function to update the date filter
      const updateDateFilter = () => {
        const year = yearInput.value.trim();
        const exactActive = exactButton.dataset.active === 'true';
        const beforeActive = beforeButton.dataset.active === 'true';
        const afterActive = afterButton.dataset.active === 'true';
        
        // Remove filter if no criteria set
        if (!year && !exactActive && !beforeActive && !afterActive) {
          delete activeFilters[index];
          applyFilters();
          return;
        }
        
        // Set the filter with appropriate parameters
        activeFilters[index] = {
          type: 'year-filter',
          year: year,
          exact: exactActive,
          before: beforeActive,
          after: afterActive
        };
        
        // Apply all filters
        applyFilters();
      };
      
      // Event listeners
      yearInput.addEventListener('input', function() {
        updateDateFilter();
      });
      
      // Helper function to handle button clicks
      const handleButtonClick = (clickedButton, otherButtons) => {
        const wasActive = clickedButton.dataset.active === 'true';
        
        // Toggle the clicked button
        updateButtonState(clickedButton, !wasActive);
        
        // If turning on, turn off others (for mutual exclusivity)
        if (!wasActive) {
          otherButtons.forEach(btn => updateButtonState(btn, false));
        }
        
        updateDateFilter();
      };
      
      exactButton.addEventListener('click', function() {
        handleButtonClick(this, [beforeButton, afterButton]);
      });
      
      beforeButton.addEventListener('click', function() {
        handleButtonClick(this, [exactButton, afterButton]);
      });
      
      afterButton.addEventListener('click', function() {
        handleButtonClick(this, [exactButton, beforeButton]);
      });
      
      // Add these elements to DOM
      filterContainer.appendChild(label);
      filterContainer.appendChild(filterInput);
      filterRow.appendChild(filterContainer);
      
      // Skip the rest of the function for the date filter
      return;
    }
    // For all other columns, create a text input
    else {
      filterInput = document.createElement('input');
      filterInput.type = 'text';
      filterInput.style.width = '100%';
      filterInput.style.padding = '3px';
      filterInput.placeholder = 'Type to filter...';
    }
    
    // Add event listener for filtering
    if (index === 4) { // Gender toggle buttons
      // Handled by toggle button event listeners
    } else { // Text input
      filterInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        if (value === '') {
          // If empty, remove this filter
          delete activeFilters[index];
        } else {
          // Otherwise, add a text filter
          activeFilters[index] = {
            type: 'text',
            value: value.toLowerCase()
          };
        }
        
        // Apply all filters
        applyFilters();
      });
    }
    
    // Add filter to container
    filterContainer.appendChild(label);
    filterContainer.appendChild(filterInput);
    
    // Add container to filter row
    filterRow.appendChild(filterContainer);
  });
  
  // Insert the filter row before the table
  table.parentNode.insertBefore(filterRow, table);
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
    row.style.backgroundColor = ''; // Remove background color
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

      // Apply different colors based on gender - uses isMale/isFemale from lib/gender-utils.js
      if (isMale(genderText)) {
        row.style.backgroundColor = '#d4e6ff'; // Light blue for males
      } else if (isFemale(genderText)) {
        row.style.backgroundColor = '#ffd4e6'; // Light pink for females
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
  
  // Reset gender toggle buttons
  const genderButtons = document.querySelectorAll('button[data-active]');
  genderButtons.forEach(button => {
    // If it's a gender button (♂/♀), set it to active
    if (button.textContent === '♂' || button.textContent === '♀') {
      button.dataset.active = 'true';
      button.style.opacity = '1';
      button.style.fontWeight = 'bold';
    } 
    // If it's a date filter button (=, <, >), set it to inactive
    else if (button.textContent === '=' || button.textContent === '<' || button.textContent === '>') {
      button.dataset.active = 'false';
      button.style.backgroundColor = '#f0f0f0';
      button.style.fontWeight = 'normal';
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

function addTopSummary(table) {
  const tfoot = table.querySelector('tfoot');
  const countCell = tfoot ? tfoot.querySelector('td[colspan]') : null;
  const span = countCell ? countCell.querySelector('span') : null;
  if (!span) return;

  const div = document.createElement('div');
  div.id = 'fdkat-top-summary';
  div.style.textAlign = 'right';
  div.style.fontSize = '13px';
  div.style.color = '#555';
  div.style.padding = '0 0 6px 0';
  div.textContent = span.textContent;

  table.parentNode.insertBefore(div, table);
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
  tr.style.backgroundColor = '#e8e8e8';

  const td = document.createElement('td');
  td.colSpan = 5;
  td.style.padding = '4px 8px';
  td.style.borderTop = '2px solid #bbb';
  td.style.fontWeight = 'bold';
  td.style.fontSize = '12px';
  td.style.color = '#555';
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

  const { cellData, colorMap } = buildPedigreeColorMap(pedigreeTable);
  if (colorMap.size === 0) return;

  addPedigreeToggle(pedigreeTable, colorMap, cellData);
  applyPedigreeColors(colorMap, cellData);
  console.log(`Pedigree: ${colorMap.size} root-cause duplicate(s) highlighted`);
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
  cellData.forEach(cell => { cell.td.style.backgroundColor = colorMap.get(cell.catId) || ''; });
}

function addPedigreeToggle(table, colorMap, cellData) {
  const container = document.createElement('div');
  container.style.marginBottom = '8px';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'pedigreeHighlightToggle';
  checkbox.checked = true;

  const label = document.createElement('label');
  label.htmlFor = 'pedigreeHighlightToggle';
  label.textContent = ' Highlight duplicate ancestors';
  label.style.cursor = 'pointer';

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      applyPedigreeColors(colorMap, cellData);
    } else {
      cellData.forEach(cell => { cell.td.style.backgroundColor = ''; });
    }
  });

  container.appendChild(checkbox);
  container.appendChild(label);
  table.parentElement.insertBefore(container, table);
}