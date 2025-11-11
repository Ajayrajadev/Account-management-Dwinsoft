@echo off
REM 🚀 Finovate Application - Windows Setup Script
REM This script will set up and run the Finovate application components

echo 🚀 Starting Finovate Application Setup...
echo =========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

echo.
echo 📦 Setting up Web Application...
echo Installing web app dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install web app dependencies
    pause
    exit /b 1
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local
    echo NEXT_PUBLIC_APP_ENV=development >> .env.local
)

echo ✅ Web application setup complete!

REM Setup desktop app if directory exists
if exist "finovate-desktop" (
    echo.
    echo 📦 Setting up Desktop Application...
    cd finovate-desktop
    echo Installing desktop app dependencies...
    call npm install
    if errorlevel 1 (
        echo ⚠️ Failed to install desktop app dependencies, continuing...
    ) else (
        echo ✅ Desktop application setup complete!
    )
    
    REM Create .env.local if it doesn't exist
    if not exist ".env.local" (
        echo Creating desktop .env.local file...
        echo ELECTRON_IS_DEV=true > .env.local
        echo DATABASE_PATH=./data/app.db >> .env.local
    )
    
    cd ..
) else (
    echo ⚠️ Desktop application directory not found, skipping...
)

REM Setup backend if directory exists
if exist "finovate-backend" (
    echo.
    echo 📦 Setting up Backend Application...
    cd finovate-backend
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ⚠️ Failed to install backend dependencies, continuing...
    ) else (
        echo ✅ Backend application setup complete!
    )
    
    REM Create .env if it doesn't exist
    if not exist ".env" (
        echo Creating backend .env file...
        echo DATABASE_URL="file:./dev.db" > .env
        echo JWT_SECRET="your-secret-key-change-in-production" >> .env
        echo PORT=8000 >> .env
        echo NODE_ENV=development >> .env
    )
    
    cd ..
) else (
    echo ⚠️ Backend application directory not found, skipping...
)

echo.
echo ✅ All components set up successfully!
echo.
echo Choose what to run:
echo 1) Web App only (recommended for quick start)
echo 2) Web App + Backend
echo 3) All applications (Web + Desktop + Backend)
echo 4) Exit (manual start)
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting Web Application...
    echo Web App will be available at: http://localhost:3000
    call npm run dev
) else if "%choice%"=="2" (
    echo Starting Web App and Backend...
    echo Web App: http://localhost:3000
    echo Backend: http://localhost:8000
    
    if exist "finovate-backend" (
        echo Starting backend in background...
        cd finovate-backend
        start /b npm run dev
        cd ..
    )
    
    echo Starting web app...
    call npm run dev
) else if "%choice%"=="3" (
    echo Starting all applications...
    echo Web App: http://localhost:3000
    echo Backend: http://localhost:8000
    echo Desktop: Electron window will open
    
    if exist "finovate-backend" (
        echo Starting backend...
        cd finovate-backend
        start /b npm run dev
        cd ..
    )
    
    if exist "finovate-desktop" (
        echo Starting desktop app...
        cd finovate-desktop
        start /b npm run dev
        cd ..
    )
    
    echo Starting web app...
    call npm run dev
) else if "%choice%"=="4" (
    echo Setup complete! You can manually start applications using:
    echo   Web App:     npm run dev
    echo   Desktop App: cd finovate-desktop ^&^& npm run dev
    echo   Backend:     cd finovate-backend ^&^& npm run dev
    pause
) else (
    echo Invalid choice. Exiting...
    pause
    exit /b 1
)

pause
