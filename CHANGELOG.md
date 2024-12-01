# Changelog

## [1.3.0] - 2024-01-12

### Fixed
- Fixed data mapping issues where fields were misaligned after row 15
- Fixed field name inconsistencies between API response and CSV structure
- Fixed React key warnings in FeatureTable component

### Enhanced
- Added robust field mapping system with support for:
  - CamelCase and snake_case field names
  - Case-insensitive matching
  - Fallback field resolution
- Improved data validation and transformation:
  - Proper empty field initialization
  - Consistent column ordering
  - Automatic Request ID generation
- Added detailed logging for debugging:
  - Raw API response data
  - Field transformation details
  - Problematic row information

## [1.2.0] - 2024-01-12

### Added
- Added support for inconsistent data formats in CSV
- Added Status column with color-coded badges
- Added Type column
- Added data normalization layer

### Enhanced
- Improved data handling with fallback values
- Added conditional rendering for optional fields
- Updated badge colors for better visual hierarchy:
  - Status: Blue (Open), Yellow (In Progress), Green (Completed), Purple (Planned)
  - Type: Gray
  - Priority: Red (High), Yellow (Medium), Green (Low)
  - Product: Blue
  - Request Channel: Purple

### Fixed
- Fixed missing descriptions after line 15
- Fixed data mapping for inconsistent CSV formats
- Added null checks for optional fields

## [1.1.0] - 2024-01-12

### Added
- Added pagination to FeatureTable with configurable page sizes (10, 20, 30, 40, 50 rows)
- Added new columns: Product and Request Channel
- Added tooltips for truncated description text

### Enhanced
- Improved column styling with distinct colors for different fields
- Added truncation for long description texts
- Added hover state for table rows

### Fixed
- Fixed React key prop warnings in FeatureTable component
- Updated column accessors to match API data structure
- Improved table rendering for feature requests data

## [1.0.0] - 2024-01-12

### Changed
- Modified FeatureTable columns to show Feature Title, Description, and Priority
- Updated styling for better readability
- Simplified Description cell rendering

### Technical Details
- Added explicit key props to all mapped elements in the table
- Updated data accessors to match the API response structure
- Maintained color-coding for Priority levels