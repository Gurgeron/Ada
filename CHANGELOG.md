# Changelog

## [0.1.0] - Initial Project Setup
### Added
- Initial project structure and file organization
- Basic configuration files:
  - README.md with project overview and setup instructions
  - .gitignore for version control
  - backend/requirements.txt with Python dependencies
  - frontend/package.json with React dependencies
  - backend/app.py with Flask application setup
- Project documentation setup

## [0.2.0] - Form Implementation - Latest
### Added
- Backend:
  - Database configuration with SQLAlchemy
  - Basic models for storing form data
  - API routes for form submission and file upload
- Frontend:
  - Simple form with product details
  - File upload with drag-and-drop
  - Basic validation
  - Success/error messaging
### Changed
- Simplified UI to focus on core functionality
- Removed multi-step wizard in favor of single form
- Streamlined file upload process

## [0.3.0] - Form Simplification
### Changed
- Simplified WizardForm to a single-page form
- Removed multi-step wizard in favor of simpler UX
- Removed user personas step
- Added success message after form submission
- Improved file upload validation
- Removed Analysis page and simplified routing

### Removed
- Analysis component and related routes
- Multi-step form navigation
- Google Sheets support (focusing on CSV and Excel)

## [0.4.0] - File Processing Implementation
### Added
- Backend:
  - FeatureRequestData model for storing processed data
  - FileProcessor service for file validation and processing
  - Data API routes for file operations:
    - POST /api/data/validate - File validation
    - POST /api/data/upload - File processing and storage
    - GET /api/data/data/:context_id - Retrieve processed data
- Features:
  - File format validation (CSV, Excel)
  - Required headers validation
  - Data normalization and cleaning
  - Priority standardization
  - Error handling and user feedback