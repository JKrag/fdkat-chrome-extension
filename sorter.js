console.log("Sorter script loaded ... 4");

let lastSortedColumn = -1;
let ascending = true;

// Listen for the window load event
window.addEventListener("load", function () {
  console.log("Page reloaded");

  // Check if the table has been added
  const table = document.querySelector("table.table.table-condensed.table-hover");
  if (table) {
    console.log("Table found");
    const headers = table.querySelectorAll("th");

    headers.forEach((header, index) => {
      //console.log("Header (" + index + "): " + header);

      header.style.textDecoration = "underline";

      header.addEventListener("click", function () {
        headers.forEach((header) => header.style.backgroundColor = "");
        // Highlight the clicked header
        header.style.backgroundColor = "lightgray";
        if (lastSortedColumn === index) {
          ascending = !ascending;
        } else {
          ascending = true;
        }
        lastSortedColumn = index;
        sortTable(index, ascending);
      });
    });
  } else {
    console.log("Table not found");
  }
});

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
  const [dayA, monthA, yearA] = a.innerText.split("-").map(Number);
  const [dayB, monthB, yearB] = b.innerText.split("-").map(Number);

  const dateA = new Date(yearA, monthA - 1, dayA);
  const dateB = new Date(yearB, monthB - 1, dayB);

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
}
