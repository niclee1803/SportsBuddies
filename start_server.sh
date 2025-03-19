#!/bin/bash

# Navigate to the backend directory and start the backend server
echo "Starting backend server..."
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Navigate to the frontend directory and start the frontend server
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for user input to stop the servers
echo "Frontend and backend servers are running."
echo "Press [CTRL+C] to stop both servers."

# Trap CTRL+C to stop both servers
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Keep the script running to allow the servers to run
wait