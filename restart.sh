#!/bin/bash
# Restart script for Smokeshop application

echo "Stopping existing Node.js processes..."
pkill -f 'node.*server.js' || true
sleep 2

echo "Starting application..."
cd "$(dirname "$0")"
PORT=3000 nohup node server.js > app.log 2>&1 &
sleep 2

echo "Checking process..."
if ps aux | grep -q '[n]ode.*server.js'; then
    echo "Application started successfully"
    ps aux | grep '[n]ode.*server.js'
else
    echo "Warning: Process not found, but command executed"
fi

exit 0
