#!/bin/bash

# Start the Flask backend server
echo "Starting Flask backend server..."
cd backend
source venv/bin/activate
flask run &

# Wait a bit for the backend to start
sleep 2

# Start the React frontend server
echo "Starting React frontend server..."
cd ../frontend
npm start 