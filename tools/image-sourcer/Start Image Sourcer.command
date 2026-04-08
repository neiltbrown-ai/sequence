#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Image Sourcer on http://localhost:3001"
echo "Close this window to stop the server."
echo ""
node server.js
