# Changelog

## [Unreleased] - 2024-01-XX
### In Development - AI-Powered Insights
- Enhanced clustering analysis
  - Improved semantic clustering to focus on feature content
  - Added detailed cluster metadata analysis
  - Added priority and impact distribution within clusters
  - Added customer type distribution analysis
  - Enhanced cluster visualization with interactive charts
  - Added key insights for each cluster
  - Improved cluster theme detection
- Enhancing Dashboard with AI-powered analysis
  - Implementing semantic clustering for similar feature requests
  - Adding intelligent pain points analysis using OpenAI
  - Improving request trends with date-based analysis
  - Adding semantic similarity for request grouping
  - Implementing advanced data processing pipeline
  - Fixed pain points percentage calculation to ensure proper distribution
  - Added insights caching for improved performance
    - Cache persists for 5 minutes
    - Prevents unnecessary reloading
    - Smart invalidation system
- Fixed backend server connectivity issues
  - Ensured proper server startup on port 3002
  - Verified API endpoints connectivity
  - Added proper CORS configuration
- Added "Open in Jira" button for critical issues
  - Direct link to Jira tickets from dashboard
  - Minimal UI design matching existing color scheme
  - Improved button placement at bottom-right of cards
  - Consistent styling across all request types
  - Secure external linking with proper rel attributes
- Improved loading experience
  - Added personalized loading messages from Ada
  - Enhanced loading animations
  - Better user feedback during data processing

### Added
- New Podcast Generation Feature (MVP)
  - Created PodcastCard component with modern UI matching existing design system
  - Added basic audio player and download functionality
  - Implemented loading states and error handling
  - Created backend route for podcast generation
  - Integrated OpenAI GPT-4 for script generation
  - Integrated OpenAI TTS for audio generation
  - Added script display functionality
  - Moved PodcastCard to top of dashboard for better visibility

### Technical Details
- Frontend:
  - New `PodcastCard.js` component with React hooks for state management
  - New `ClusterInsights.js` component for detailed cluster analysis
  - Integrated with axios for API calls
  - Added error handling and loading states
  - Added script toggle functionality
  - Matched existing design system colors and styling
  - Added PodcastCard to top of Dashboard layout

- Backend:
  - New `podcast.py` route blueprint
  - Enhanced clustering service with metadata analysis
  - Improved semantic analysis using GPT-4
  - Integrated OpenAI GPT-4 for generating podcast scripts
  - Integrated OpenAI TTS for converting scripts to audio
  - Implemented file storage for generated podcasts
  - Added proper error handling and response structure
  - Configured to use environment variables for API keys

### Security Updates
- Removed hardcoded API keys
- Added proper environment variable configuration
- Updated .gitignore to exclude sensitive files

### Next Steps
- Add audio file cleanup mechanism
- Implement caching for generated podcasts
- Add progress indicators for script and audio generation
- Add analytics for podcast generation and usage

## [Latest Changes]
- Updated pie chart title from "Requests by Category" to "Feature Request Categories" for better clarity and professionalism
- Fixed CORS configuration in backend to properly handle frontend requests
  - Added specific origin (http://localhost:3000)
  - Configured allowed methods and headers
  - Applied to all API routes

## [2023-12-20] - Enhanced Cluster Visualization
### Added
- New BubbleChart component for visualizing feature request clusters
- Interactive bubble visualization with Ada's color scheme
- Tooltips showing cluster details on hover
- Responsive layout that adapts to different screen sizes

### Changed
- Updated ClusterInsights component to include the bubble chart visualization
- Improved cluster data presentation with cleaner UI
- Reorganized cluster information display for better readability

### Technical Details
- Implemented using react-chartjs-2 bubble chart
- Added smooth animations and transitions
- Used Ada's color palette for consistent branding
- Optimized rendering performance for large datasets

## [2023-12-20] - Bubble Chart Improvements
### Added
- Implemented d3-force for non-overlapping bubble layout
- Added force simulation for optimal bubble positioning
- Improved bubble spacing with collision detection
- Added smooth transitions between positions

### Changed
- Updated bubble chart to use d3 force-directed layout
- Optimized bubble sizes and padding
- Improved chart responsiveness
- Enhanced visual clarity with better spacing

### Technical Details
- Integrated d3-force library for physics-based layout
- Added force simulation with collision detection
- Implemented center force for balanced distribution
- Added padding between bubbles for better readability

## [2023-12-20] - Major Bubble Chart Enhancement
### Added
- Completely rewrote bubble chart using pure D3.js
- Interactive drag-and-drop functionality for bubbles
- Dynamic labels that scale with bubble size
- Improved legend with better visibility
- Bubble size now accurately reflects data proportions

### Changed
- Switched from Chart.js to D3.js for better control
- Enhanced force simulation parameters for optimal spacing
- Improved bubble collision detection
- Added interactive features and smooth animations
- Implemented proper bounds checking to keep bubbles in view

### Technical Details
- Used D3 force simulation with custom parameters
- Implemented SVG-based visualization
- Added dynamic text scaling for better readability
- Enhanced collision detection with proper padding
- Added interactive drag behavior for user exploration

## [2023-12-20] - Bubble Chart Layout Improvements
### Changed
- Removed labels from bubbles for cleaner visualization
- Added dedicated legend area with white background
- Improved legend formatting with wrapped text
- Added hover tooltips for bubble information
- Optimized space usage with separate chart and legend areas

### Added
- Text wrapping for long category names in legend
- Hover tooltips showing category and request count
- Clear separation between chart and legend areas
- Better spacing for legend items

### Technical Details
- Reserved 200px width for legend area
- Implemented text wrapping algorithm for long labels
- Added SVG title elements for tooltips
- Improved force simulation bounds to respect legend area

## [2023-12-20] - Bubble Chart UX Improvements
### Enhanced
- Improved tooltip information to show cluster name, size, and priority percentage
- Fixed legend text overlap issues with dynamic spacing
- Added ellipsis for long category names in legend
- Improved legend layout with two-line information display

### Changed
- Increased legend width to 250px for better readability
- Implemented dynamic spacing between legend items
- Added bullet separator between request count and priority
- Truncated long category names with ellipsis

### Technical Details
- Added dynamic calculation of legend item spacing
- Implemented text truncation for long category names
- Enhanced tooltip formatting with multiple lines
- Improved legend text layout and spacing

## [2023-12-20] - Enhanced Bubble Chart Tooltips
### Added
- Custom HTML tooltip with improved formatting
- Hover highlight effect on bubbles
- Detailed information display on hover
- Smooth tooltip positioning

### Changed
- Replaced SVG title with custom HTML tooltip
- Added visual feedback on bubble hover
- Improved tooltip content layout
- Enhanced tooltip styling with shadow and border

### Technical Details
- Implemented D3 HTML tooltip
- Added mouse position tracking for tooltip
- Enhanced bubble interactivity
- Added proper tooltip cleanup on unmount

## [2023-12-20] - Bug Fixes and Improvements
### Fixed
- Updated cluster data fetching to use correct insights endpoint
- Fixed React warning about non-boolean error attribute in file uploader
- Improved error handling in cluster visualization

### Changed
- Refactored CustomFileUploader component to use inline styles
- Updated API endpoint for cluster data retrieval
- Improved error state handling in cluster visualization

## [Latest]
- Refined BubbleChart styling for a more subtle and elegant look
  - Enhanced tooltip design with smoother transitions and improved typography
  - More subtle hover effects and interactions
  - Improved spacing and visual hierarchy
  - Better color contrast and opacity balance
- Implemented cluster data caching using session storage
  - Added persistence between tab switches
  - Improved loading performance for returning users
  - Added error handling for storage operations
  - Included lastUpdated timestamp tracking
  - Added clearCache functionality
- Updated ClusterInsights to use ClusterContext for data persistence
  - Implemented caching between tab switches
  - Added loading state management
  - Improved error handling
  - Optimized data fetching to prevent unnecessary API calls
  - Added LoadingSpinner component integration
- Improved clustering algorithm
  - Enhanced embedding generation to use both title and description
  - Added title weighting for better semantic understanding
  - Adjusted cluster size determination to be more flexible
  - Improved cluster quality with better silhouette score handling
  - Fixed issue with small number of clusters
- Improved clustering algorithm to create more meaningful groups:
  - Adjusted distance threshold calculation to be more lenient
  - Changed clustering method from ward to average linkage
  - Switched to cosine similarity for better text comparison
  - Added minimum threshold to prevent too many small clusters
- Adjusted clustering algorithm to create broader, more general groups:
  - Increased distance threshold multiplier for more inclusive clusters
  - Raised minimum threshold percentile to ensure fewer clusters
  - Added maximum clusters constraint for consistency
  - Enhanced fallback threshold for more stable grouping
- Further generalized clustering algorithm to create fewer, broader groups:
  - Reduced maximum number of clusters from 10 to 7
  - Increased distance threshold multiplier to 2.5 for even more inclusive clusters
  - Raised minimum threshold to 85th percentile
  - Added minimum cluster size requirement (at least 10% of total points)
  - Enhanced fallback threshold to 90th percentile for maximum stability
- Enhanced Dendrogram visualization:
  - Fixed text overflow issues with truncation
  - Added tooltips to show full text on hover
  - Increased right margin for better text display
  - Adjusted layout sizing for better readability
  - Added overflow control to container
- Enhanced dendrogram visualization readability:
  - Increased font sizes throughout (14-17px)
  - Added font weight distinctions for hierarchy
  - Enlarged node circles and hover states
  - Improved text truncation with longer limits
  - Added distinct colors for main clusters
  - Fixed text overflow issues with proper margins
- Centered dendrogram visualization:
  - Balanced left and right margins
  - Added container centering styles
  - Adjusted layout sizing for better balance
  - Improved SVG positioning
  - Added flex centering to container
- Expanded dendrogram visualization size:
  - Reduced margins for more usable space
  - Increased visualization width to 85% of container
  - Increased container height to 450px
  - Adjusted centering offset for better balance
  - Optimized spacing for larger visualization
- Synchronized visualization color schemes:
  - Updated bubble chart colors to match dendrogram
  - Implemented consistent color mapping by theme
  - Enhanced stroke and highlight effects
  - Improved color contrast and visibility
  - Added darker stroke variations for depth
- Made cluster list expandable:
  - Added collapsible sections for each cluster
  - Implemented smooth expand/collapse animations
  - Added dropdown arrow indicators
  - Improved cluster header styling
  - Enhanced interaction feedback