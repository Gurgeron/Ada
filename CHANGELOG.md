# Changelog

## [Latest]
- Added tabbed interface for Analysis and Dashboard views:
  - Created AnalysisContainer component with tab navigation
  - Separated table and dashboard into different tabs
  - Maintained chat interface across both views
  - Added URL-based tab state management
  - Used consistent styling with main color palette
- Restored full layout with table and chat interface
- Added responsive grid layout (2/3 table, 1/3 chat)
- Improved sticky chat positioning for desktop
- Cleaned up debug code and console logs
- Restored dashboard view with insights and metrics
- Added tabbed navigation between table and dashboard views
- Added main header with title and description
- Improved tab styling and transitions
- Installed chart.js and react-chartjs-2 dependencies
- Added chart components for data visualization
- Added insight cards for metrics display
- Added dashboard layout with responsive grid
- Implemented insights API endpoint with mock data
- Added insights route and blueprint
- Added mock data for dashboard visualization
- Added proper error handling for insights endpoint
- Implemented sticky columns for better table navigation
- Added shadow effect for sticky columns
- Added proper z-index handling for overlapping elements
- Updated table header to be sticky on vertical scroll only
- Improved table scroll behavior for better usability
- Enhanced table layout and structure

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

## [1.0.5] - 2024-01-20

### Fixed
- Fixed FeatureTable rendering issues
  - Added proper header property handling (Header/header)
  - Added fallback for column IDs
  - Added null/undefined checks for values
  - Added fallback values for column widths

## [1.0.4] - 2024-01-20

### Fixed
- Restored original grid layout with improved styling
  - Kept the original grid-cols-3 structure
  - Added proper background colors and shadows
  - Fixed spacing and margins
  - Improved container styling

### Changed
- Simplified layout structure while maintaining functionality
- Added proper headers and descriptions
- Fixed height calculations
- Enhanced visual consistency

## [1.0.3] - 2024-01-20

### Fixed
- Improved overall layout and component visibility
  - Fixed height calculations for all components
  - Added proper overflow handling
  - Improved spacing and padding
  - Enhanced visual hierarchy

### Added
- Added welcome message to chat interface
- Added proper headers and descriptions
- Added loading states and error handling
- Added consistent shadows and rounded corners

### Changed
- Updated layout structure to use flex instead of grid
- Modified height calculations for better viewport fit
- Improved component styling and transitions
- Enhanced responsive design

## [1.0.2] - 2024-01-20

### Fixed
- Restored proper layout for chatbot and dashboard
  - Fixed the main content and chat interface layout
  - Improved responsive design with proper flex layout
  - Added proper shadow and rounded corners
  - Fixed sticky positioning for chat interface
  - Adjusted height calculations for better viewport fit

## [1.0.1] - 2024-01-20

### Fixed
- Fixed rendering issues in FeatureTable component
  - Added data validation and sanitization
  - Enhanced column configuration with proper fallbacks
  - Improved error handling for null/undefined values
  - Fixed styling issues with column widths
  - Added proper type checking for data and columns

### Added
- Added data sanitization layer to handle invalid input
- Added fallback values for missing properties
- Added string conversion for cell values

### Changed
- Updated column width handling to use fallback values
- Modified cell rendering to handle null/undefined values
- Updated column configuration to be more flexible

## [Unreleased]
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
- Updated app.py to register insights blueprint
- Enhanced dashboard UI with responsive grid layout
- Improved chart styling and interactivity
- Updated layout to accommodate both table and dashboard views
- Enhanced header styling and spacing
- Improved tab interaction feedback
- Table rendering issues
- Column configuration and data handling
- Layout responsiveness on different screen sizes
- Chart dependency issues
- Dashboard component loading
- Layout responsiveness on different screen sizes
- Fixed 404 errors for insights API endpoint
- Improved data loading in Dashboard component
- Added proper error handling for missing or invalid data
- Updated table layout to support horizontal scrolling
- Enhanced table styling with better visual separation
- Improved table responsiveness and usability
- Fixed sticky column positioning
- Improved table scroll behavior
- Enhanced visual consistency across table elements
- Fixed table header behavior to match Excel-like freeze panes
- Improved horizontal scrolling to include all columns
- Enhanced visual consistency of table header