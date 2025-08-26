let booksData = [];
let processedResults = [];
let showIROnly = false;

// Wrap all initialization code in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // File upload event listener
    document.getElementById('file-upload').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            handleFileUpload(this.files[0]);
        }
    });

    // Other button listeners
    document.getElementById('clear-button').addEventListener('click', clearForm);
    document.getElementById('download-button').addEventListener('click', downloadResults);
    document.getElementById('copy-selected').addEventListener('click', copySelectedRows);
    document.getElementById('show-ir-only').addEventListener('change', function(e) {
        showIROnly = e.target.checked;
        displayResults();
    });

    // Initialize data loading
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('data.json');
        booksData = await response.json();
        console.log('Data loaded:', booksData.length);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function handleFileUpload(file) {
    const reader = new FileReader();
    
    reader.onloadend = function() {
        if (reader.readyState === FileReader.DONE) {
            const content = reader.result;
            const lines = content.split(/[\r\n]+/)
                .filter(line => line.trim())
                .map(line => line.trim());
            
            processedResults = [];
            
            lines.forEach(line => {
                const parts = line.split(',').map(item => item.trim());
                const [orderRef, sequence, isbn, response, message] = parts;
                const isAvailable = booksData.some(book => book.code === isbn);
                
                processedResults.push({
                    orderRef,
                    sequence,
                    isbn,
                    response,
                    message,
                    status: isAvailable ? 'Available' : 'Not Available'
                });
            });
            
            updateDashboard();
            displayResults();
            document.getElementById('download-button').disabled = false;
        }
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
    };
    
    reader.readAsText(file);
}

function updateDashboard() {
    const dashboardSection = document.getElementById('dashboard-section');
    
    if (processedResults.length === 0) {
        dashboardSection.classList.add('dashboard-hidden');
        return;
    }

    // Show dashboard
    dashboardSection.classList.remove('dashboard-hidden');

    // Calculate statistics
    const totalCount = processedResults.length;
    const acceptedCount = processedResults.filter(row => row.status === 'Available').length;
    const rejectedCount = processedResults.filter(row => row.status === 'Not Available').length;

    // Update dashboard elements
    document.getElementById('total-count').textContent = totalCount.toLocaleString();
    document.getElementById('accepted-count').textContent = acceptedCount.toLocaleString();
    document.getElementById('rejected-count').textContent = rejectedCount.toLocaleString();
}

function displayResults() {
    const resultsDiv = document.getElementById('results-table');
    resultsDiv.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    
    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add checkbox header
    const checkboxHeader = document.createElement('th');
    const headerCheckbox = document.createElement('input');
    headerCheckbox.type = 'checkbox';
    headerCheckbox.addEventListener('change', (e) => {
        const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateCopyButton();
    });
    checkboxHeader.appendChild(headerCheckbox);
    headerRow.appendChild(checkboxHeader);
    
    ['Order Ref', 'Sequence', 'ISBN', 'Response', 'Message', 'Status'].forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        if (index === 4) {
            th.style.width = '25%';
        }
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    processedResults.forEach((row, index) => {
        // Skip non-IR rows when filter is active
        if (showIROnly && row.status !== 'Not Available') {
            return;
        }

        const tr = document.createElement('tr');
        tr.className = row.status === 'Available' ? 'result-available' : 'result-unavailable';
        
        // Add checkbox cell
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.row = index;
        checkbox.addEventListener('change', updateCopyButton);
        checkboxCell.appendChild(checkbox);
        tr.appendChild(checkboxCell);
        
        let displayResponse = row.response;
        let displayMessage = row.message;
        
        if (row.status === 'Not Available') {
            displayResponse = 'IR';
            displayMessage = 'Item Template not found';
        }
        
        [row.orderRef, row.sequence, row.isbn, displayResponse, displayMessage, row.status].forEach((text, index) => {
            const td = document.createElement('td');
            td.textContent = text;
            if (index === 3 && text.trim() === 'IR') {
                td.className = 'response-ir';
            }
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    resultsDiv.appendChild(table);
    document.getElementById('copy-selected').disabled = true;
}

function updateCopyButton() {
    const hasChecked = document.querySelectorAll('#results-table tbody input[type="checkbox"]:checked').length > 0;
    document.getElementById('copy-selected').disabled = !hasChecked;
}

async function copySelectedRows() {
    const table = document.querySelector('#results-table table');
    const checkedBoxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) return;
    
    // Create HTML table
    const tableHTML = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Add header row (excluding checkbox column)
    const headerCells = Array.from(table.querySelectorAll('thead th')).slice(1);
    const headerRow = document.createElement('tr');
    headerCells.forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell.textContent;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tableHTML.appendChild(thead);
    
    // Add selected rows
    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const newRow = document.createElement('tr');
        Array.from(row.cells).slice(1).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.textContent;
            if (cell.classList.contains('response-ir')) {
                td.style.backgroundColor = '#dc3545';
                td.style.color = 'white';
            }
            newRow.appendChild(td);
        });
        tbody.appendChild(newRow);
    });
    tableHTML.appendChild(tbody);

    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([tableHTML.outerHTML], {type: 'text/html'}),
                'text/plain': new Blob([tableHTML.innerText], {type: 'text/plain'})
            })
        ]);
        alert('Selected rows copied to clipboard');
    } catch (err) {
        console.error('Copy failed:', err);
        alert('Failed to copy to clipboard');
    }
}

function clearForm() {
    document.getElementById('upload-form').reset();
    document.getElementById('results-table').innerHTML = '';
    document.getElementById('dashboard-section').classList.add('dashboard-hidden');
    document.getElementById('download-button').disabled = true;
    document.getElementById('copy-selected').disabled = true;
    document.getElementById('show-ir-only').checked = false;
    showIROnly = false;
    processedResults = [];
}

function downloadResults() {
    if (!processedResults.length) return;
    
    const outputLines = processedResults.map(row => {
        let response = row.response;
        let message = row.message;
        
        if (row.status === 'Not Available') {
            response = 'IR';
            message = 'Item Template not found';
        }
        
        return `${row.orderRef},${row.sequence},${row.isbn},${response},${message}`;
    }).join('\n');

    const fileInput = document.getElementById('file-upload');
    const originalName = fileInput.files[0].name;
    const options = {
        suggestedName: originalName,
        types: [{
            description: 'CSV file',
            accept: { 'text/csv': ['.csv', '.ppr'] }
        }]
    };

    try {
        window.showSaveFilePicker(options)
            .then(handle => handle.createWritable())
            .then(writer => {
                writer.write(outputLines);
                return writer.close();
            })
            .catch(err => {
                console.error('Error saving file:', err);
                const blob = new Blob([outputLines], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = originalName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
    } catch (err) {
        console.error('ShowSaveFilePicker not supported:', err);
        const blob = new Blob([outputLines], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize data loading
fetchData();