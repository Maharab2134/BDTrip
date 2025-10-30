#!/bin/bash

# BDTrip Project Stop Script
# This script stops all servers

echo "🛑 Stopping BDTrip Project..."

# Kill processes from PID files
if [ -f /tmp/bdtrip-json-server.pid ]; then
    JSON_PID=$(cat /tmp/bdtrip-json-server.pid)
    kill $JSON_PID 2>/dev/null && echo "✅ JSON Server stopped (PID: $JSON_PID)"
    rm -f /tmp/bdtrip-json-server.pid
fi

if [ -f /tmp/bdtrip-python-server.pid ]; then
    PYTHON_PID=$(cat /tmp/bdtrip-python-server.pid)
    kill $PYTHON_PID 2>/dev/null && echo "✅ Python HTTP Server stopped (PID: $PYTHON_PID)"
    rm -f /tmp/bdtrip-python-server.pid
fi

# Force kill any remaining processes on ports
echo "🧹 Cleaning up ports..."
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:8000 | xargs -r kill -9 2>/dev/null

echo "✅ All servers stopped successfully!"
