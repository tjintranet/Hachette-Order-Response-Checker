# Order Response Checker

Web application for processing and validating order response files against a product database.

## Features

- File upload support for CSV and PPR files
- ISBN validation against data.json
- Row selection with checkboxes
- Copy selected rows as formatted table
- Download processed file with updated values
- Response status highlighting (IR responses in red)
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

1. **ISBN Validation**
   - Checks ISBN against data.json
   - Updates Status column: Available/Not Available
   - For unavailable items:
     - Changes Response to "IR"
     - Changes Message to "Item Template not found"

2. **Row Selection**
   - Individual row selection
   - Select all checkbox in header
   - Copy selected rows as formatted table
   - Retains formatting (IR highlighting)

3. **File Operations**
   - Download maintains original file name and format
   - File save dialog for download location
   - Updated values reflected in download

4. **UI Features**
   - Response highlighting (IR in red with white text)
   - Clear function resets all inputs
   - Responsive table layout
   - Message column width optimized for content

## Browser Compatibility

Tested and working in:
- Chrome
- Safari
- Firefox

## Dependencies

- Bootstrap 5.3.0
- SheetJS 0.17.0

## Installation

1. Place files in web directory:
   - index.html
   - script.js
   - data.json

2. Ensure proper file permissions
3. No additional setup required