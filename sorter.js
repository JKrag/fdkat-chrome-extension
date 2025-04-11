console.log("Sorter script loaded ... ");

let lastSortedColumn = -1;
let ascending = true;
let colorCodingEnabled = true; // Default to enabled
let activeFilters = {}; // Track active filters for each column

// Listen for the window load event
window.addEventListener("load", function () {
  console.log("Page reloaded");

  // Check if the table has been added
  const table = document.querySelector("table.table.table-condensed.table-hover");
  if (table) {
    console.log("Table found");
    const headers = table.querySelectorAll("th");

    // Add color toggle control above the table
    addColorToggle(table);
    
    // Add column filters to the table
    addColumnFilters(table, headers);

    headers.forEach((header, index) => {
      header.style.textDecoration = "underline";

      header.addEventListener("click", function () {
        headers.forEach((header) => header.style.backgroundColor = "");
        // Highlight the clicked header
        header.style.backgroundColor = "lightblue";
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
    console.log("Table not found");
  }
});

// Function to add the color toggle control
function addColorToggle(table) {
  // Create a container for the toggle
  const toggleContainer = document.createElement("div");
  toggleContainer.style.marginBottom = "10px";
  toggleContainer.style.textAlign = "right";
  
  // Create the checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "colorToggle";
  checkbox.checked = colorCodingEnabled;
  
  // Create the label
  const label = document.createElement("label");
  label.htmlFor = "colorToggle";
  label.textContent = "Color code by gender";
  label.style.marginLeft = "5px";
  label.style.fontWeight = "normal";
  
  // Add event listener to toggle color coding
  checkbox.addEventListener("change", function() {
    colorCodingEnabled = this.checked;
    if (colorCodingEnabled) {
      colorCodeCatsByGender();
    } else {
      removeColorCoding();
    }
  });
  
  // Assemble the toggle control
  toggleContainer.appendChild(checkbox);
  toggleContainer.appendChild(label);
  
  // Insert the toggle before the table
  table.parentNode.insertBefore(toggleContainer, table);
}

// Function to add column-specific filters
function addColumnFilters(table, headers) {
  // Create a container for all filter inputs
  const filterRow = document.createElement("div");
  filterRow.style.display = "flex";
  filterRow.style.marginBottom = "15px";
  filterRow.style.marginTop = "10px";
  filterRow.style.alignItems = "flex-end";
  
  // Get column widths to match filters to columns
  const columnWidths = Array.from(headers).map(header => {
    const style = window.getComputedStyle(header);
    return Math.max(100, header.offsetWidth - 10) + "px"; // Minimum width 100px
  });
  
  // Create filter inputs for each column
  headers.forEach((header, index) => {
    const filterContainer = document.createElement("div");
    filterContainer.style.flex = "1";
    filterContainer.style.padding = "0 5px";
    filterContainer.style.maxWidth = columnWidths[index];
    
    // Get header text for label
    const headerText = header.textContent.trim().replace(/[▲▼]/, "");
    
    // Create label
    const label = document.createElement("div");
    label.textContent = "Filter: " + headerText;
    label.style.fontSize = "12px";
    label.style.marginBottom = "3px";
    
    // Create filter based on column type
    let filterInput;
    
    // Column 4 is gender - create a select dropdown
    if (index === 4) {
      filterInput = document.createElement("select");
      filterInput.style.width = "100%";
      filterInput.style.padding = "3px";
      
      // Add options
      const options = [
        { value: "", text: "All" },
        { value: "male", text: "Males" },
        { value: "female", text: "Females" }
      ];
      
      options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        filterInput.appendChild(option);
      });
    } 
    // Column 3 is date - add special date filter
    else if (index === 3) {
      // Create a container for date range
      filterInput = document.createElement("div");
      filterInput.style.display = "flex";
      filterInput.style.gap = "3px";
      
      // From date
      const fromDate = document.createElement("input");
      fromDate.type = "text";
      fromDate.placeholder = "From";
      fromDate.style.flex = "1";
      fromDate.style.padding = "3px";
      fromDate.style.width = "50%";
      fromDate.style.fontSize = "12px";
      
      // To date
      const toDate = document.createElement("input");
      toDate.type = "text";
      toDate.placeholder = "To";
      toDate.style.flex = "1";
      toDate.style.padding = "3px";
      toDate.style.width = "50%";
      toDate.style.fontSize = "12px";
      
      // Add date inputs to container
      filterInput.appendChild(fromDate);
      filterInput.appendChild(toDate);
      
      // Set up event listeners for date range inputs
      fromDate.addEventListener("input", function() {
        const fromVal = this.value.trim();
        const toVal = toDate.value.trim();
        
        // Update the filter for this column
        activeFilters[index] = {
          type: "date-range",
          from: fromVal,
          to: toVal
        };
        
        // Apply all filters
        applyFilters();
      });
      
      toDate.addEventListener("input", function() {
        const fromVal = fromDate.value.trim();
        const toVal = this.value.trim();
        
        // Update the filter for this column
        activeFilters[index] = {
          type: "date-range",
          from: fromVal,
          to: toVal
        };
        
        // Apply all filters
        applyFilters();
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
      filterInput = document.createElement("input");
      filterInput.type = "text";
      filterInput.style.width = "100%";
      filterInput.style.padding = "3px";
      filterInput.placeholder = "Type to filter...";
    }
    
    // Add event listener for filtering
    if (index === 4) { // Gender dropdown
      filterInput.addEventListener("change", function() {
        // Get selected value
        const selectedValue = this.value;
        
        if (selectedValue === "") {
          // If "All" selected, remove this filter
          delete activeFilters[index];
        } else {
          // Otherwise, add a gender filter
          activeFilters[index] = {
            type: "gender",
            value: selectedValue
          };
        }
        
        // Apply all filters
        applyFilters();
      });
    } else { // Text input
      filterInput.addEventListener("input", function() {
        const value = this.value.trim();
        
        if (value === "") {
          // If empty, remove this filter
          delete activeFilters[index];
        } else {
          // Otherwise, add a text filter
          activeFilters[index] = {
            type: "text",
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

// Function to apply all active filters
function applyFilters() {
  const table = document.querySelector("table.table.table-condensed.table-hover");
  const tbody = table.querySelector("tbody");
  const tfoot = table.querySelector("tfoot");
  
  // Get all data rows from tbody
  const rows = Array.from(tbody.querySelectorAll("tr"));
  
  // Get the summary row from tfoot
  const summaryRow = tfoot ? tfoot.querySelector("tr") : null;
  
  // Show all rows if no filters active
  if (Object.keys(activeFilters).length === 0) {
    rows.forEach(row => {
      row.style.display = "";
    });
    
    // Reset summary row to show only total count if we have one
    if (summaryRow) {
      resetSummaryRow(summaryRow);
    }
    
    return;
  }
  
  // Track visible rows count
  let visibleRowCount = 0;
  
  // Apply filters to each row
  rows.forEach((row) => {
    let showRow = true;
    
    // Check each active filter
    for (const [columnIndex, filter] of Object.entries(activeFilters)) {
      const cell = row.cells[columnIndex];
      
      // Skip if no cell for this column
      if (!cell) continue;
      
      // Get cell content
      const cellContent = cell.textContent.trim();
      
      // Apply filter based on type
      if (filter.type === "text") {
        // Simple text filtering
        if (!cellContent.toLowerCase().includes(filter.value)) {
          showRow = false;
          break;
        }
      } 
      else if (filter.type === "gender") {
        // Gender filtering
        const genderLower = cellContent.toLowerCase();
        
        if (filter.value === "male") {
          // Check for male variations
          if (!(genderLower === 'm' || genderLower === 'male' || 
              genderLower === 'han' || genderLower === 'hankat' || 
              genderLower === 'hann' || genderLower === 'hannkatt' || 
              genderLower === 'uros')) {
            showRow = false;
            break;
          }
        } 
        else if (filter.value === "female") {
          // Check for female variations
          if (!(genderLower === 'f' || genderLower === 'female' || 
              genderLower === 'hun' || genderLower === 'hunkat' || 
              genderLower === 'hunn' || genderLower === 'hunnkatt' || 
              genderLower === 'naaras')) {
            showRow = false;
            break;
          }
        }
      }
      else if (filter.type === "date-range") {
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
    }
    
    // Show or hide row based on filter results
    row.style.display = showRow ? "" : "none";
    
    // Count visible rows
    if (showRow) {
      visibleRowCount++;
    }
  });
  
  // Always show summary row and update counts
  if (summaryRow) {
    // Update the summary text to show filtered/total counts
    updateSummaryRowCounts(summaryRow, visibleRowCount, rows.length);
  }
}

// Function to reset summary row to original state
function resetSummaryRow(summaryRow) {
  // Get the cell with the count (the one with colspan)
  const countCell = summaryRow.querySelector("td[colspan]");
  
  // If we've modified it before, it will have a data-original attribute
  if (countCell && countCell.hasAttribute("data-original")) {
    // Get the span element inside
    const span = countCell.querySelector("span");
    if (span) {
      span.textContent = countCell.getAttribute("data-original");
    }
  }
}

// Function to update summary row with filtered/total counts
function updateSummaryRowCounts(summaryRow, visibleCount, totalCount) {
  // Get the cell with the count (the one with colspan)
  const countCell = summaryRow.querySelector("td[colspan]");
  
  if (!countCell) return;
  
  // Get the span element with the count
  const span = countCell.querySelector("span");
  
  if (!span) return;
  
  // Store original text if we haven't already
  if (!countCell.hasAttribute("data-original")) {
    countCell.setAttribute("data-original", span.textContent);
  }
  
  // Get the original text
  const originalText = countCell.getAttribute("data-original");
  
  // Extract just the number suffix (e.g., "stk.", "kpl")
  const countSuffix = originalText.replace(/\d+/g, "").trim();
  
  // Update the text to show both filtered and total counts
  span.textContent = `${visibleCount} / ${totalCount} ${countSuffix}`;
}

// Function to remove color coding
function removeColorCoding() {
  const table = document.querySelector("table.table.table-condensed.table-hover");
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  
  rows.forEach(row => {
    row.style.backgroundColor = ""; // Remove background color
  });
}

// Function to color code cats by gender
function colorCodeCatsByGender() {
  console.log("Applying color coding for cats by gender");
  
  // First remove any existing color coding
  removeColorCoding();
  
  // Only apply colors if the feature is enabled
  if (!colorCodingEnabled) return;
  
  const table = document.querySelector("table.table.table-condensed.table-hover");
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  
  // Process all rows and check if the last one is a summary row
  rows.forEach((row, index) => {
    // Check if this is a data row (has the gender cell with content)
    const genderCell = row.cells[4];
    if (genderCell && genderCell.innerText.trim()) {
      const gender = genderCell.innerText.trim().toLowerCase();
      
      // Apply different colors based on gender across different languages
      // Male: m, male, han, hann, hannkatt, uros
      // Female: f, female, hun, hunn, hunnkatt, naaras
      if (gender === 'm' || gender === 'male' || 
          gender === 'han' || gender === 'hankat' || 
          gender === 'hann' || gender === 'hannkatt' || 
          gender === 'uros') {
        row.style.backgroundColor = "#d4e6ff"; // Light blue for males
      } else if (gender === 'f' || gender === 'female' || 
                gender === 'hun' || gender === 'hunkat' || 
                gender === 'hunn' || gender === 'hunnkatt' || 
                gender === 'naaras') {
        row.style.backgroundColor = "#ffd4e6"; // Light pink for females
      }
    }
  });
}

// Custom sort function for column 0
function sortColumnREG(a, b) {
  const textA = a.innerText.trim();
  const textB = b.innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 1
function sortColumnName(a, b) {
  const textA = a.querySelector("a").innerText.trim();
  const textB = b.querySelector("a").innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 2
function sortColumnBreed(a, b) {
  const textA = a.querySelector("span").innerText.trim();
  const textB = b.querySelector("span").innerText.trim();
  return textA.localeCompare(textB);
}

// Custom sort function for column 3 (Date of Birth)
function sortColumnDOB(a, b) {

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split(/[-.]/).map(Number);
    return new Date(year, month - 1, day);
  };

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
  console.log("Sort by column: " + columnIndex);

  const table = document.querySelector("table.table.table-condensed.table-hover");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  const sortFunctions = [sortColumnREG, sortColumnName, sortColumnBreed, sortColumnDOB, sortColumnGender];

  // Sort rows based on the content of the specified column
  rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex];
    const cellB = rowB.cells[columnIndex];
    const compare = sortFunctions[columnIndex](cellA, cellB);
    return ascending ? compare : -compare;
  });
  // Remove the last row (summary row)
  const summaryRow = rows.pop();

  // Clear existing rows in tbody
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  // Append sorted rows to tbody
  rows.forEach((row) => tbody.appendChild(row));

  // Append the summary row back to the bottom
  tbody.appendChild(summaryRow);

  updateSortIndicator(columnIndex, ascending);

}

// Function to update the sort indicator on the column header
function updateSortIndicator(columnIndex, ascending) {
  const headers = document.querySelectorAll("th");
  // First, remove any existing indicators from all headers
  headers.forEach(header => {
    header.innerHTML = header.innerHTML.replace(/ \u25B2|\u25BC/g, ""); // Removes existing arrows
  });

  // Then, add the indicator to the current header
  const currentHeader = headers[columnIndex];
  currentHeader.innerHTML += ascending ? " \u25B2" : " \u25BC"; // Adds an arrow up or down
  
  // Reapply color coding after sorting
  if (colorCodingEnabled) {
    colorCodeCatsByGender();
  }
}