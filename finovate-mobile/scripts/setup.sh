#!/bin/bash

# Finovate Mobile Setup Script
echo "🚀 Setting up Finovate Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "⚠️  Backend is not running. Please start the backend server:"
    echo "   cd ../finovate-backend && npm run dev"
fi

echo ""
echo "🎉 Setup complete! You can now run the app:"
echo ""
echo "📱 Start development server:"
echo "   npm start"
echo ""
echo "🍎 Run on iOS:"
echo "   npm run ios"
echo ""
echo "🤖 Run on Android:"
echo "   npm run android"
echo ""
echo "🌐 Run on Web:"
echo "   npm run web"
echo ""
echo "Demo credentials:"
echo "📧 Email: demo@finovate.com"
echo "🔑 Password: password123"
