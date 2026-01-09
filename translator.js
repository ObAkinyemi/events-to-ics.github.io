

// This runs as soon as the page loads
window.onload = function() {
  showExample();
};

function showExample() {
    const exampleCSV = `Date,Class,Assignment type
27-Jan,Bio,GR 1
23-Feb,Bio,GR 2
13-Apr,CS220,PEX 0`;

const results = Papa.parse(exampleCSV, { header: true });

let tableHtml = '<table><thead><tr>';

// Create Headers
Object.keys(results.data[0]).forEach(key => {
        tableHtml += `<th>${key}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
    // Create Rows
    results.data.forEach(row => {
      tableHtml += '<tr>';
      Object.values(row).forEach(val => {
            tableHtml += `<td>${val}</td>`;
          });
        tableHtml += '</tr>';
      });
    tableHtml += '</tbody></table>';
    
    document.getElementById('tablePreview').innerHTML = tableHtml;
  }
  
  // Keep your existing convertFile() and processData() functions below this...

  // We'll use CDN links in the HTML to load the libraries.
  // This function runs when the user clicks "Convert"
  async function convertFile() {
      const fileInput = document.getElementById('csvFile');
      const yearInput = document.getElementById('yearInput').value;
      
      if (!fileInput.files[0]) {
          alert("Please select a CSV file first!");
          return;
      }
  
      const file = fileInput.files[0];
      
      // 1. Read the CSV file
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
              processData(results.data, yearInput);
          }
      });
  }
  
function processData(data, year) {
    const monthMap = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'apri': 4, 
        'may': 5, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 
        'oct': 10, 'nov': 11, 'dec': 12
    };

    let calendarContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//My Assignment Calendar//EN\r\n";

    // Helper to add a zero to numbers like "1" -> "01"
    const pad = (n) => n < 10 ? '0' + n : n;

    data.forEach(record => {
        const rawDate = record['Date'];
        const className = record['Class'];
        const assignmentType = record['Assignment type'];

        if (rawDate && className && assignmentType) {
            const dateParts = rawDate.split('-');
            if (dateParts.length >= 2) {
                const day = parseInt(dateParts[0]);
                const monthStr = dateParts[1].toLowerCase();
                const month = monthMap[monthStr];

                if (day && month) {
                    const startString = `${year}${pad(month)}${pad(day)}T080000`;
                    const endString = `${year}${pad(month)}${pad(day)}T090000`;
                    
                    // Generate a consistent ID based on the assignment data
                    // This prevents duplicates if you import the file twice!
                    const uniqueID = `${className}-${assignmentType}@assignments`.replace(/\s/g, '');

                    calendarContent += "BEGIN:VEVENT\r\n";
                    calendarContent += `UID:${uniqueID}\r\n`; // Keeps it unique
                    calendarContent += `DTSTART:${startString}\r\n`;
                    calendarContent += `DTEND:${endString}\r\n`;
                    calendarContent += `SUMMARY:${className}: ${assignmentType}\r\n`;
                    calendarContent += "END:VEVENT\r\n";
                }
            }
        }
    });

    calendarContent += "END:VCALENDAR";

    // Trigger the download
    const blob = new Blob([calendarContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Assignments.ics';
    a.click();
    window.URL.revokeObjectURL(url);
}