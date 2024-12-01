# Changelog

## [Latest]
- Added tabbed interface for Analysis and Dashboard views:
  - Created AnalysisContainer component with tab navigation
  - Separated table and dashboard into different tabs
  - Maintained chat interface across both views
  - Added URL-based tab state management
  - Used consistent styling with main color palette

## [Previous]
- Added new Insights Dashboard feature:
  - Created main Dashboard component with responsive layout
  - Added InsightCard component for displaying metrics
  - Integrated Chart.js for data visualization
  - Implemented various card types (list, percentage, distribution, score)
  - Added loading and error states
  - Used consistent color palette and styling

## [1.3.1] - 2024-01-12

### Added
- Added line numbers column to feature table for easier reference
- Line numbers are zero-padded and monospaced for better readability
- Line numbers persist across pagination and sorting

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

## [Unreleased]

### Added
- Implemented insights API endpoint (`/api/insights/fetch-insights/<context_id>`)
- Created analysis utility functions for generating insights from feature requests
- Added Dashboard component with interactive charts and summary cards
- Integrated Chart.js for data visualization
- Added error handling and loading states for insights data

### Fixed
- Fixed 404 errors for insights API endpoint
- Improved data loading in Dashboard component
- Added proper error handling for missing or invalid data
- Fixed boolean attribute warning by creating a CustomFileUploader component to properly handle error states
- Improved file upload error handling with better prop management
- Enhanced component structure for better maintainability
- Resolved styled-components warning by implementing proper transient props ($hasError) for FileUploader styling
- Improved component architecture with styled-components for better prop handling
- Eliminated DOM warnings related to boolean attributes
- Fixed insights endpoint 404 error by implementing proper data storage in feature_request_items table
- Enhanced file upload to store data in both FeatureRequestData and FeatureRequest tables
- Improved insights generation with detailed metrics and analysis
- Added proper error handling and logging for insights endpoint

### Changed
- Updated app.py to register insights blueprint
- Enhanced dashboard UI with responsive grid layout
- Improved chart styling and interactivity