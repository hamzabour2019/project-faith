@echo off
echo ========================================
echo   The Project Faith - Clothing Store
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo.
    pause
    exit /b 1
)

echo.
echo Setting up database with sample data...
node backend/seedData.js
if %errorlevel% neq 0 (
    echo WARNING: Failed to seed database. You may need to install MongoDB first.
    echo.
)

echo.
echo Starting the server...
echo.
echo The website will be available at:
echo - Main site: http://localhost:3000
echo - Admin panel: http://localhost:3000/admin
echo - API: http://localhost:3000/api
echo.
echo Admin login:
echo - Email: admin@theprojectfaith.com
echo - Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
