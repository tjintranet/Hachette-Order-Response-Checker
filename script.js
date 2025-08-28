let booksData = [];
let processedResults = [];
let showIROnly = false;
let showOtherErrors = false;
let showAvailableOnly = false;

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
    document.getElementById('download-button').addEventListener('click', () => downloadResults(false));
    document.getElementById('download-all').addEventListener('click', (e) => {
        e.preventDefault();
        downloadResults(false);
    });
    document.getElementById('download-exclude-errors').addEventListener('click', (e) => {
        e.preventDefault();
        downloadResults(true);
    });
    document.getElementById('copy-selected').addEventListener('click', copySelectedRows);
    document.getElementById('show-ir-only').addEventListener('change', function(e) {
        showIROnly = e.target.checked;
        if (e.target.checked) {
            document.getElementById('show-other-errors').checked = false;
            document.getElementById('show-available-only').checked = false;
            showOtherErrors = false;
            showAvailableOnly = false;
        }
        displayResults();
    });
    
    document.getElementById('show-other-errors').addEventListener('change', function(e) {
        showOtherErrors = e.target.checked;
        if (e.target.checked) {
            document.getElementById('show-ir-only').checked = false;
            document.getElementById('show-available-only').checked = false;
            showIROnly = false;
            showAvailableOnly = false;
        }
        displayResults();
    });
    
    document.getElementById('show-available-only').addEventListener('change', function(e) {
        showAvailableOnly = e.target.checked;
        if (e.target.checked) {
            document.getElementById('show-ir-only').checked = false;
            document.getElementById('show-other-errors').checked = false;
            showIROnly = false;
            showOtherErrors = false;
        }
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
                
                // Determine if this is an "other error" (available in database but has error response/message)
                const isOtherError = isAvailable && response && (
                    response.toUpperCase() === 'IR' || 
                    (message && message.toLowerCase().includes('error')) ||
                    (message && message.toLowerCase().includes('unavailable')) ||
                    (message && message.toLowerCase().includes('not available')) ||
                    (response && response.toUpperCase() !== 'AR')
                );
                
                processedResults.push({
                    orderRef,
                    sequence,
                    isbn,
                    response,
                    message,
                    status: isAvailable ? 'Available' : 'Not Available',
                    isOtherError: isOtherError
                });
            });
            
            updateDashboard();
            displayResults();
            document.getElementById('download-button').disabled = false;
            document.getElementById('download-dropdown').disabled = false;
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
    const acceptedCount = processedResults.filter(row => row.status === 'Available' && !row.isOtherError).length;
    const rejectedCount = processedResults.filter(row => row.status === 'Not Available').length;
    const otherErrorsCount = processedResults.filter(row => row.isOtherError).length;

    // Update dashboard elements
    document.getElementById('total-count').textContent = totalCount.toLocaleString();
    document.getElementById('accepted-count').textContent = acceptedCount.toLocaleString();
    document.getElementById('rejected-count').textContent = rejectedCount.toLocaleString();
    document.getElementById('other-errors-count').textContent = otherErrorsCount.toLocaleString();
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
        // Apply filters
        if (showIROnly && row.status !== 'Not Available') {
            return;
        }
        if (showOtherErrors && !row.isOtherError) {
            return;
        }
        if (showAvailableOnly && (row.status !== 'Available' || row.isOtherError)) {
            return;
        }

        const tr = document.createElement('tr');
        
        // Set row styling based on status and error type
        if (row.status === 'Available' && !row.isOtherError) {
            tr.className = 'result-available';
        } else if (row.isOtherError) {
            tr.className = 'table-warning'; // Yellow background for other errors
        } else {
            tr.className = 'result-unavailable'; // Red background for not available
        }
        
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
        let displayStatus = row.status;
        
        if (row.status === 'Not Available') {
            displayResponse = 'IR';
            displayMessage = 'Item Template not found';
        } else if (row.isOtherError) {
            displayStatus = 'Other Error';
        }
        
        [row.orderRef, row.sequence, row.isbn, displayResponse, displayMessage, displayStatus].forEach((text, index) => {
            const td = document.createElement('td');
            td.textContent = text;
            if (index === 3 && text.trim().toUpperCase() === 'IR') {
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
    document.getElementById('download-dropdown').disabled = true;
    document.getElementById('copy-selected').disabled = true;
    document.getElementById('show-ir-only').checked = false;
    document.getElementById('show-other-errors').checked = false;
    document.getElementById('show-available-only').checked = false;
    showIROnly = false;
    showOtherErrors = false;
    showAvailableOnly = false;
    processedResults = [];
}

function downloadResults(excludeOtherErrors = false) {
    if (!processedResults.length) return;
    
    // Filter results based on the exclude option
    const resultsToDownload = excludeOtherErrors 
        ? processedResults.filter(row => !row.isOtherError)
        : processedResults;
    
    const outputLines = resultsToDownload.map(row => {
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
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const extension = originalName.split('.').pop();
    
    // Add suffix to filename if excluding other errors
    const fileName = excludeOtherErrors 
        ? `${baseName}_filtered.${extension}`
        : originalName;
    
    const options = {
        suggestedName: fileName,
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
                link.download = fileName;
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
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize data loading
fetchData();