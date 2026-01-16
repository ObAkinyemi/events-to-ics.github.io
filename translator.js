// Note: We only need PapaParse now. We will build the ICS file manually.

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

function convertFile() {
    const yearInput = document.getElementById('yearInput').value;
    const fileInput = document.getElementById('csvFile');

    if (fileInput.files.length === 0) {
        alert("Please upload a CSV file first!");
        return;
    }

    const file = fileInput.files[0];

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            generateMajorEventsICS(results.data, yearInput);
        }
    });
}

function generateMajorEventsICS(csvData, year) {
    const events = [];

    const monthMap = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4, 'apri': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'sept': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12
    };

    // ADDED: 'index' is now the second argument here
    csvData.forEach((record, index) => {
        const rawDate = record['Date']; 
        const className = record['Class'];
        const assignmentType = record['Assignment type'];

        if (rawDate && className && assignmentType) {
            const dateParts = rawDate.trim().split(/[- ]+/); 

            if (dateParts.length >= 2) {
                const day = parseInt(dateParts[0]);
                const monthStr = dateParts[1].toLowerCase();
                const month = monthMap[monthStr];
                const eventYear = parseInt(year);

                if (eventYear && month && day) {
                    
                    // --- NEW CODE: Generate Unique ID ---
                    // Format: YYYYMMDD-Class-Assignment-Index
                    // We remove spaces from Class/Assignment to make the ID cleaner
                    const cleanClass = className.replace(/\s+/g, '');
                    const cleanAssignment = assignmentType.replace(/\s+/g, '');
                    const uidString = `${eventYear}${month}${day}-${cleanClass}-${cleanAssignment}-${index}`;

                    events.push({
                        title: `${className}: ${assignmentType}`,
                        description: `Assignment: ${assignmentType}`,
                        startYear: eventYear,
                        startMonth: month,
                        startDay: day,
                        startHour: 8,
                        startMinute: 0,
                        uid: uidString // Save the ID here
                    });
                }
            }
        }
    });

    const icsContent = buildICSFile(events);
    downloadFile('Major_Assignment_Events.ics', icsContent);
}

// --- NEW HELPER FUNCTIONS ---

// This manually writes the text for the calendar file
function buildICSFile(events) {
    let icsString = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My Calendar Tool//EN\n";

    events.forEach(event => {
        const pad = (n) => n < 10 ? '0' + n : n;
        const dateStr = `${event.startYear}${pad(event.startMonth)}${pad(event.startDay)}T${pad(event.startHour)}${pad(event.startMinute)}00`;
        
        icsString += "BEGIN:VEVENT\n";
        icsString += `UID:${event.uid}\n`; // --- NEW CODE: Write the UID ---
        icsString += `SUMMARY:${event.title}\n`;
        icsString += `DESCRIPTION:${event.description}\n`;
        icsString += `DTSTART:${dateStr}\n`;
        icsString += `DTEND:${dateStr}\n`;
        icsString += "END:VEVENT\n";
    });

    icsString += "END:VCALENDAR";
    return icsString;
}

function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}