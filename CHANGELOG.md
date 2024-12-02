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
- Added "AI that GET your user" subheader to Analysis page
- Restored Ada header while keeping navigation icon removed
- Removed duplicate icon from navigation tabs
- Moved Ada header to top of Analysis container
- Added markdown support in Ada chat messages
- Added consistent spacing and alignment across all elements
- Removed redundant "Feature Request Analysis" header from Analysis component
- Streamlined interface by removing duplicate headers
- Improved visual hierarchy and reduced clutter
- Removed "Feature Request Analysis" header for cleaner interface
- Adjusted layout spacing for better visual hierarchy
- Implemented insights API endpoint (`/api/insights/fetch-insights/<context_id>`)
- Created analysis utility functions for generating insights from feature requests
- Added Dashboard component with interactive charts and summary cards
- Integrated Chart.js for data visualization
- Added error handling and loading states for insights data
- Fixed select dropdown styling to prevent arrow overlap with numbers
- Added proper padding and custom arrow styling for better visual appearance
- Implemented Google Sheets-like sticky header functionality
- Added vertical scroll with fixed header while maintaining horizontal scroll behavior
- Improved table header visibility with subtle background and border styling
- Fixed table row borders to extend fully across all columns
- Improved table cell alignment and spacing
- Fixed table row borders by implementing proper border-collapse and full-width table
- Improved table layout with consistent column widths and borders
- Enhanced table cell spacing and alignment
- Fixed Implementation Complexity column width to properly display header text
- Added minimum width of 200px for Implementation Complexity column
- Added Critical Priority Features card to Dashboard
- Implemented filtering and display of critical priority items
- Added visual indicators and detailed information for critical features
- Fixed Critical Priority Features filter to properly detect Critical priority items
- Added improved case handling for Priority values
- Added debug logging for feature data processing
- Fixed Critical Features card to properly detect and display Critical priority items
- Improved data handling to support both camelCase and PascalCase field names
- Added better error handling and data validation for feature data
- Updated Critical Features card color scheme to use brand colors instead of red
- Improved visual hierarchy with softer, more professional color palette
- Enhanced readability of critical feature items
- Updated landing page Start Analysis button to be more compact
- Improved button styling with consistent brand colors
- Added arrow icon for better visual feedback
- Updated landing page with decorative chart icon
- Restored black color scheme for Start Analysis button
- Improved button hover state with subtle color transition
- Centered chart icon on landing page using flex container
- Improved landing page layout and spacing
- Added chart icon to top left of analysis page
- Improved navigation layout with consistent branding
- Enhanced visual hierarchy in analysis container
- Moved chart icon next to Ada header on landing page
- Reduced spacing between elements for better visual flow
- Improved landing page layout proportions
- Improved landing page horizontal centering with flex layout
- Enhanced responsive layout with better width control
- Added consistent spacing and alignment across all elements
- Enhanced landing page button hover effect with scale transform and shadow
- Improved landing page horizontal centering with flex layout
- Enhanced responsive layout with better width control
- Added consistent spacing and alignment across all elements
- Updated landing page button hover color to brand color (#4c9085)
- Enhanced landing page button hover effect with scale transform and shadow
- Improved landing page horizontal centering with flex layout
- Enhanced responsive layout with better width control
- Added consistent spacing and alignment across all elements
- Updated landing page button hover color to lighter gray (#666666)
- Enhanced landing page button hover effect with scale transform and shadow
- Improved landing page horizontal centering with flex layout
- Enhanced responsive layout with better width control
- Added consistent spacing and alignment across all elements
- Updated landing page button hover color to lighter gray (#C7C7C7)
- Enhanced landing page button hover effect with scale transform and shadow
- Improved landing page horizontal centering with flex layout
- Added consistent spacing and alignment across all elements
- Adjusted header icon position slightly lower for better visual balance
- Updated wizard step indicators to use Roman numerals
- Changed step indicator font to serif for better Roman numeral display
- Adjusted header icon position slightly lower for better visual balance
- Updated landing page button hover color to lighter gray (#C7C7C7)
- Enhanced landing page button hover effect with scale transform and shadow
- Added consistent spacing and alignment across all elements
- Updated wizard step completion indicator to a minimalistic dot symbol
- Updated wizard step indicators to use Roman numerals
- Changed step indicator font to serif for better Roman numeral display
- Adjusted header icon position slightly lower for better visual balance
- Updated landing page button hover color to lighter gray (#C7C7C7)
- Enhanced landing page button hover effect with scale transform and shadow
- Added consistent spacing and alignment across all elements
- Added markdown support in Ada chat messages
- Installed react-markdown for message rendering
- Added Tailwind typography plugin for markdown styling
- Updated wizard step completion indicator to minimalistic dot symbol
- Updated wizard step indicators to use Roman numerals
- Changed step indicator font to serif for better Roman numeral display
- Added consistent spacing and alignment across all elements
- Added row numbers to feature table with zero-padding
- Added markdown support in Ada chat messages
- Installed react-markdown for message rendering
- Added Tailwind typography plugin for markdown styling
- Updated wizard step completion indicator to minimalistic dot symbol
- Added consistent spacing and alignment across all elements
- Fixed infinite update loop in feature table row numbers
- Added row numbers to feature table with zero-padding
- Added markdown support in Ada chat messages
- Installed react-markdown for message rendering
- Added Tailwind typography plugin for markdown styling
- Updated wizard step completion indicator to minimalistic dot symbol
- Added consistent spacing and alignment across all elements
- Adjusted chat container height for better screen fit
- Fixed infinite update loop in feature table row numbers
- Added row numbers to feature table with zero-padding
- Added markdown support in Ada chat messages
- Installed react-markdown for message rendering
- Added Tailwind typography plugin for markdown styling
- Updated wizard step completion indicator to minimalistic dot symbol
- Added consistent spacing and alignment across all elements
- Added Ada header with icon to Analysis page
- Adjusted chat container height for better screen fit
- Fixed infinite update loop in feature table row numbers
- Added row numbers to feature table with zero-padding
- Added markdown support in Ada chat messages
- Added consistent spacing and alignment across all elements

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