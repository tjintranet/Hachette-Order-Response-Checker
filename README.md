# Order Response Checker

Web application for processing and validating order response files against a product database.

## Features

- File upload support for CSV and PPR files
- ISBN validation against data.json
- Comprehensive statistics dashboard with real-time metrics
- Advanced filtering options for different error types
- Row selection with checkboxes
- Copy selected rows as formatted table
- Flexible download options (all lines or filtered)
- Response status highlighting with color coding
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
   The dashboard displays four key metrics in a single compact row:
   - **Total Lines**: Count of all processed records
   - **Available**: Items found in database with successful responses (no errors)
   - **Other Errors**: Items found in database but with error responses/messages
   - **Missing (IR)**: Items not found in database (converted to IR responses)
   
   Dashboard appears after file processing and hides when cleared with real-time updates based on processed data.

### 2. **ISBN Validation & Status Classification**
   - Checks ISBN against data.json database
   - **Available**: ISBN found in database + successful response (AR or no error indicators)
   - **Other Errors**: ISBN found in database but has error indicators:
     - Response code is "IR"
     - Message contains "error", "unavailable", or "not available"  
     - Response code is not "AR"
   - **Not Available**: ISBN not found in database
     - Changes Response to "IR"
     - Changes Message to "Item Template not found"

### 3. **Advanced Filtering Options**
   Three mutually exclusive filter toggles:
   - **Show Missing File Lines Only**: Displays only items not found in database (IR responses)
   - **Show Other Error Messages Only**: Displays only items in database but with error responses
   - **Show Available Only**: Displays only items in database with successful responses
   
   Filters are mutually exclusive - selecting one automatically deselects others.

### 4. **Row Selection & Copy**
   - Individual row selection with checkboxes
   - Select all checkbox in header
   - Copy selected rows as formatted table to clipboard
   - Retains visual formatting (IR highlighting, color coding)

### 5. **Flexible Download Options**
   Split-button dropdown with two download modes:
   - **Download All Lines**: Complete file with all processed data (default)
   - **Download Excluding Other Errors**: Filtered file omitting "Other Error" lines
     - Only includes Available and Missing (IR) items
     - Adds "_filtered" suffix to filename
     - Maintains original file format and structure

### 6. **Visual Status Indicators**
   - **Green background**: Available items (successful processing)
   - **Yellow background**: Other errors (in database but with issues)
   - **Red background**: Missing items (not in database, converted to IR)
   - **Red text**: IR response codes for emphasis

## Dashboard Layout

The compact dashboard fits all metrics in one row:

| Total Lines | Available | Other Errors | Missing (IR) |
|------------|-----------|--------------|-------------|
| All records | Successful items | Database items with errors | Items not found |

## Filtering Workflow

1. **Upload file** → View complete dashboard statistics
2. **Apply filters** → Focus on specific issue types:
   - Use "Other Errors" to investigate database items with problems
   - Use "Missing" to review items that will get IR responses
   - Use "Available" to verify successful processing
3. **Download options** → Choose appropriate output:
   - Download all for complete audit trail
   - Download filtered for clean processing files

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
2. **Review Dashboard**: View automatic statistics showing processing breakdown
3. **Apply Filters**: Use toggles to focus on specific issue types
4. **Select & Copy**: Choose specific rows and copy as formatted table
5. **Download Results**: 
   - Click main button for complete file
   - Use dropdown for filtered file excluding other errors
6. **Clear & Repeat**: Reset application to process another file

## File Naming

- **Standard download**: Uses original filename
- **Filtered download**: Adds "_filtered" suffix (e.g., "orders_filtered.csv")
- **File extensions**: Preserves original format (.csv, .ppr, etc.)