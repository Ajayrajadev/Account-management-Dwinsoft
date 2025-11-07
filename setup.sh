#!/bin/bash

# 🚀 Finovate Application - Automated Setup Script
# This script will set up and run the Finovate application components

set -e  # Exit on any error

echo "🚀 Starting Finovate Application Setup..."
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_status "npm $(npm -v) is installed"
}

# Setup main web application
setup_web_app() {
    print_info "Setting up Web Application..."
    
    # Install dependencies
    print_info "Installing web app dependencies..."
    npm install
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_info "Creating .env.local file..."
        cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_ENV=development
EOL
    fi
    
    print_status "Web application setup complete!"
}

# Setup desktop application
setup_desktop_app() {
    print_info "Setting up Desktop Application..."
    
    if [ -d "finovate-desktop" ]; then
        cd finovate-desktop
        
        # Install dependencies
        print_info "Installing desktop app dependencies..."
        npm install
        
        # Create .env.local if it doesn't exist
        if [ ! -f ".env.local" ]; then
            print_info "Creating desktop .env.local file..."
            cat > .env.local << EOL
ELECTRON_IS_DEV=true
DATABASE_PATH=./data/app.db
EOL
        fi
        
        cd ..
        print_status "Desktop application setup complete!"
    else
        print_warning "Desktop application directory not found, skipping..."
    fi
}

# Setup backend application
setup_backend() {
    print_info "Setting up Backend Application..."
    
    if [ -d "finovate-backend" ]; then
        cd finovate-backend
        
        # Install dependencies
        print_info "Installing backend dependencies..."
        npm install
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            print_info "Creating backend .env file..."
            cat > .env << EOL
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=8000
NODE_ENV=development
EOL
        fi
        
        # Setup database (if Prisma is available)
        if [ -f "package.json" ] && grep -q "prisma" package.json; then
            print_info "Setting up database..."
            npm run db:generate 2>/dev/null || print_warning "Database generation failed, continuing..."
            npm run db:migrate 2>/dev/null || print_warning "Database migration failed, continuing..."
        fi
        
        cd ..
        print_status "Backend application setup complete!"
    else
        print_warning "Backend application directory not found, skipping..."
    fi
}

# Function to start applications
start_applications() {
    echo ""
    print_info "Setup complete! Choose what to run:"
    echo "1) Web App only (recommended for quick start)"
    echo "2) Web App + Backend"
    echo "3) All applications (Web + Desktop + Backend)"
    echo "4) Exit (manual start)"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            print_info "Starting Web Application..."
            npm run dev
            ;;
        2)
            print_info "Starting Web App and Backend..."
            print_info "Web App will start at http://localhost:3000"
            print_info "Backend will start at http://localhost:8000"
            
            # Start backend in background
            if [ -d "finovate-backend" ]; then
                cd finovate-backend
                npm run dev &
                BACKEND_PID=$!
                cd ..
            fi
            
            # Start web app
            npm run dev
            ;;
        3)
            print_info "Starting all applications..."
            print_info "Web App: http://localhost:3000"
            print_info "Backend: http://localhost:8000"
            print_info "Desktop: Electron window will open"
            
            # Start backend in background
            if [ -d "finovate-backend" ]; then
                cd finovate-backend
                npm run dev &
                BACKEND_PID=$!
                cd ..
            fi
            
            # Start desktop app in background
            if [ -d "finovate-desktop" ]; then
                cd finovate-desktop
                npm run dev &
                DESKTOP_PID=$!
                cd ..
            fi
            
            # Start web app (foreground)
            npm run dev
            ;;
        4)
            print_info "Setup complete! You can manually start applications using:"
            echo "  Web App:     npm run dev"
            echo "  Desktop App: cd finovate-desktop && npm run dev"
            echo "  Backend:     cd finovate-backend && npm run dev"
            ;;
        *)
            print_error "Invalid choice. Exiting..."
            exit 1
            ;;
    esac
}

# Cleanup function
cleanup() {
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$DESKTOP_PID" ]; then
        kill $DESKTOP_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🔍 Checking prerequisites..."
    check_nodejs
    check_npm
    
    echo ""
    echo "📦 Setting up applications..."
    setup_web_app
    setup_desktop_app
    setup_backend
    
    echo ""
    print_status "All components set up successfully!"
    
    start_applications
}

# Run main function
main
