console.log("Sorter script loaded ... 3");


// Listen for the window load event
window.addEventListener("load", function () {
  console.log("Page reloaded");

  const observer = new MutationObserver((mutations) => {
    console.log("DOM changed");
    mutations.forEach((mutation) => {
      console.log("Mutation observed");
      if (mutation.addedNodes.length) {
        console.log("Node added");
        // Check if the table has been added
        const table = document.querySelector("table.table.table-condensed.table-hover");
        if (table) {
          console.log("Table found");
          const headers = table.querySelectorAll("th");

          headers.forEach((header, index) => {
            console.log("Header (" + index + "): " + header);

            header.addEventListener("click", function () {
              sortTable(index);
            });
          });
          console.log("Table found. Injecting sorting logic.");
          //observer.disconnect(); // Stop observing if you wish
        } else {
          console.log("Table not found");
        }
      }
    });
  });
  // Start observing

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
});

function sortTable(n) {
  console.log("Sort by column: " + n);
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.querySelector("table.table.table-condensed.table-hover");
  switching = true;

  while (switching) {
    switching = false;
    rows = table.querySelectorAll("tbody tr");

    for (i = 0; i < (rows.length - 1); i++) { // Include the last data row
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];

      if (x && y) {
        var xVal, yVal;

        if (n === 1) {
          xVal = x.querySelector("a").textContent.trim();
          yVal = y.querySelector("a").textContent.trim();
        } else if (n === 2) {
          xVal = x.querySelector("span").textContent.trim();
          yVal = y.querySelector("span").textContent.trim();
        } else {
          xVal = x.innerHTML.trim();
          yVal = y.innerHTML.trim();
        }

        // If sorting by date (column index 3)
        if (n === 3 && xVal && yVal) {
          var xDateParts = xVal.split('-');
          var yDateParts = yVal.split('-');
          var xDate = new Date(xDateParts[2], xDateParts[1] - 1, xDateParts[0]);
          var yDate = new Date(yDateParts[2], yDateParts[1] - 1, yDateParts[0]);

          if (xDate > yDate) {
            shouldSwitch = true;
            break;
          }
        } else {
          if (xVal.toLowerCase() > yVal.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
