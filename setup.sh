#!/bin/bash

# AI Image Generator - Complete Setup and Run Script
# This script sets up and runs both frontend and backend

set -e

echo "╔═════════════════════════════════════════════════════════╗"
echo "║  AI Image Generator - Setup & Run                      ║"
echo "╚═════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "═══════════════════════════════════════════════════════════"
echo "Setting up Backend Server..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cd server

if [ ! -f ".env" ]; then
    echo "Creating server/.env from template..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env and add your REPLICATE_API_TOKEN"
    echo ""
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo ""

# Setup Frontend
echo "═══════════════════════════════════════════════════════════"
echo "Setting up Frontend..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cd ..

if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo "✅ .env created (configured for http://localhost:8000)"
else
    echo "✅ .env already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Setup Complete! ✅"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 IMPORTANT: Edit server/.env and add your REPLICATE_API_TOKEN"
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server"
echo "  npm start"
echo ""
echo "Terminal 2 (Frontend - in new terminal):"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
