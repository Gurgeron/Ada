# Changelog

## [Unreleased] - 2024-01-XX
### In Development - AI-Powered Insights
- Enhancing Dashboard with AI-powered analysis
  - Implementing semantic clustering for similar feature requests
  - Adding intelligent pain points analysis using OpenAI
  - Improving request trends with date-based analysis
  - Adding semantic similarity for request grouping
  - Implementing advanced data processing pipeline
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
  - Integrated with axios for API calls
  - Added error handling and loading states
  - Added script toggle functionality
  - Matched existing design system colors and styling
  - Added PodcastCard to top of Dashboard layout

- Backend:
  - New `podcast.py` route blueprint
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