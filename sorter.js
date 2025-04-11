console.log("Sorter script loaded ... ");

let lastSortedColumn = -1;
let ascending = true;
let colorCodingEnabled = true; // Default to enabled

// Listen for the window load event
window.addEventListener("load", function () {
  console.log("Page reloaded");

  // Check if the table has been added
  const table = document.querySelector("table.table.table-condensed.table-hover");
  if (table) {
    console.log("Table found");
    const headers = table.querySelectorAll("th");

    // Add controls above the table
    addTableControls(table);

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

// Function to add controls above the table (filter input and color toggle)
function addTableControls(table) {
  // Create a container for all controls
  const controlsContainer = document.createElement("div");
  controlsContainer.style.marginBottom = "15px";
  controlsContainer.style.display = "flex";
  controlsContainer.style.justifyContent = "space-between";
  controlsContainer.style.alignItems = "center";
  
  // Create filter container (left side)
  const filterContainer = document.createElement("div");
  
  // Create filter label
  const filterLabel = document.createElement("label");
  filterLabel.htmlFor = "tableFilter";
  filterLabel.textContent = "Filter cats: ";
  filterLabel.style.marginRight = "5px";
  
  // Create filter input
  const filterInput = document.createElement("input");
  filterInput.type = "text";
  filterInput.id = "tableFilter";
  filterInput.placeholder = "Type to filter...";
  filterInput.style.padding = "3px";
  filterInput.style.width = "200px";
  
  // Add event listener for filtering
  filterInput.addEventListener("input", function() {
    filterTable(this.value);
  });
  
  // Assemble filter controls
  filterContainer.appendChild(filterLabel);
  filterContainer.appendChild(filterInput);
  
  // Create color toggle container (right side)
  const toggleContainer = document.createElement("div");
  
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
  
  // Add both control sets to the container
  controlsContainer.appendChild(filterContainer);
  controlsContainer.appendChild(toggleContainer);
  
  // Insert the controls before the table
  table.parentNode.insertBefore(controlsContainer, table);
}

// Function to filter the table based on input text
function filterTable(filterText) {
  const table = document.querySelector("table.table.table-condensed.table-hover");
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  
  // Skip the last row (summary row) if it exists
  const dataRows = rows.length > 1 ? rows.slice(0, -1) : rows;
  
  // Normalize filter text (lowercase, no extra spaces)
  const filter = filterText.toLowerCase().trim();
  
  // Show all rows if filter is empty
  if (filter === "") {
    dataRows.forEach(row => {
      row.style.display = "";
    });
    return;
  }
  
  // Check each row against the filter
  dataRows.forEach(row => {
    let rowText = "";
    
    // Collect text from all cells in the row
    Array.from(row.cells).forEach(cell => {
      rowText += cell.textContent.trim() + " ";
    });
    
    // Check if row contains the filter text
    if (rowText.toLowerCase().includes(filter)) {
      row.style.display = ""; // Show the row
    } else {
      row.style.display = "none"; // Hide the row
    }
  });
  
  // Always show summary row if exists
  if (rows.length > dataRows.length) {
    rows[rows.length - 1].style.display = "";
  }
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