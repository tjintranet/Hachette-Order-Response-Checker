# Order Response Checker

Web application for processing and validating order response files against a product database.

## Features

- File upload support for CSV and PPR files
- ISBN validation against data.json
- Statistics dashboard with real-time metrics
- Row selection with checkboxes
- Copy selected rows as formatted table
- Download processed file with updated values
- Response status highlighting (IR responses in red)
- Filter to show only rejected (IR) items
- Responsive Bootstrap UI

## File Format Requirements

Input file must be CSV/PPR format with columns:
- Order Ref
- Sequence
- ISBN
- Response
- Message

## JSON Database Structure

data.json format:
```json
{
  "code": "9781407406992",
  "description": "Book Title",
  "setupdate": "5/3/2014"
}
```

## Functionality

### 1. **Dashboard Statistics**
   - **Total Lines**: Count of all processed records
   - **Accepted**: Count of items found in database (Available status)
   - **Rejected (IR)**: Count of items not found in database
   - Dashboard appears after file processing and hides when cleared
   - Real-time updates based on processed data

### 2. **ISBN Validation**
   - Checks ISBN against data.json
   - Updates Status column: Available/Not Available
   - For unavailable items:
     - Changes Response to "IR"
     - Changes Message to "Item Template not found"

### 3. **Row Selection**
   - Individual row selection with checkboxes
   - Select all checkbox in header
   - Copy selected rows as formatted table
   - Retains formatting (IR highlighting)

### 4. **Filtering Options**
   - "Show Missing File Lines Only" toggle
   - Filters table to display only rejected (IR) items
   - Dashboard statistics remain unchanged when filtering

### 5. **File Operations**
   - Download maintains original file name and format
   - File save dialog for download location
   - Updated values reflected in download

### 6. **UI Features**
   - Clean statistics dashboard with card-based layout
   - Response highlighting (IR in red with white text)
   - Clear function resets all inputs and hides dashboard
   - Responsive table layout
   - Message column width optimized for content
   - Hover effects on dashboard cards

## Dashboard Metrics

The dashboard provides three key metrics:

- **Total Lines**: Shows the complete count of processed records
- **Accepted**: Items successfully found in the database
- **Rejected (IR)**: Items that will receive "Item Template not found" responses

## Browser Compatibility

Tested and working in:
- Chrome
- Safari
- Firefox

## Dependencies

- Bootstrap 5.3.2
- FontAwesome 6.4.0
- SheetJS 0.17.0

## Installation

1. Place files in web directory:
   - index.html
   - script.js
   - data.json

2. Ensure proper file permissions
3. No additional setup required

## Usage

1. **Upload File**: Select a CSV or PPR file using the file upload input
2. **View Dashboard**: Automatic statistics display showing processing results
3. **Review Results**: Table shows all records with status and updated responses
4. **Filter Data**: Toggle "Show Missing File Lines Only" to view rejected items
5. **Select Rows**: Use checkboxes to select specific rows for copying
6. **Copy Data**: Copy selected rows as formatted table to clipboard
7. **Download**: Save processed file with updated IR responses and messages
8. **Clear**: Reset application to process another file