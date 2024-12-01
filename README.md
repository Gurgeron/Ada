# Feature Request Insights Platform

A modern platform for Product Managers to analyze feature requests and uncover customer pain points.

## Features
- 🧙‍♂️ Product Context Wizard
- 🤖 Ada AI Assistant
- 📊 Interactive Feature Request Table
- 📁 Multi-format File Upload Support

## Tech Stack
- Frontend: React.js with TailwindCSS
- Backend: Flask (Python)
- Database: PostgreSQL
- AI: OpenAI GPT-4
- File Processing: pandas

## Project Structure
```
feature-request-insights/
├── frontend/                 # React frontend application
├── backend/                  # Flask backend application
├── docs/                     # Project documentation
└── scripts/                  # Utility scripts
```

## Getting Started
1. Clone the repository
2. Set up environment variables
3. Install dependencies
4. Run development servers

## Development Setup
### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

## Environment Variables
Create `.env` files in both frontend and backend directories:

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/feature_insights
OPENAI_API_KEY=your_api_key
``` 