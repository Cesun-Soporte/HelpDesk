#!/bin/bash
set -e

echo "Installing client dependencies..."
cd client
npm install
echo "Building client..."
npm run build
cd ..
echo "Build complete!"
