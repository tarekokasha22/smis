@echo off
chcp 65001 >nul 2>&1
title SMIS - Sports Medical Information System

echo ============================================================
echo    SMIS - نظام إدارة الصحة الرياضية المتكامل
echo    Sports Medical Information System
echo ============================================================
echo.

REM ──────────────────────────────────────────────
REM  Step 1: Check prerequisites
REM ──────────────────────────────────────────────
echo [1/6] Checking prerequisites...

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from: https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in PATH.
    pause
    exit /b 1
)

where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo         Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo        Node.js : OK
echo        npm     : OK
echo        Docker  : OK
echo.

REM ──────────────────────────────────────────────
REM  Step 2: Start MySQL via Docker
REM ──────────────────────────────────────────────
echo [2/6] Starting MySQL database via Docker...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start Docker containers.
    echo         Make sure Docker Desktop is running.
    pause
    exit /b 1
)
echo        MySQL started on port 3306
echo.

REM ──────────────────────────────────────────────
REM  Step 3: Install dependencies
REM ──────────────────────────────────────────────
echo [3/6] Installing dependencies...

echo        Installing root dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install root dependencies.
    pause
    exit /b 1
)

echo        Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..

echo        Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..

echo        All dependencies installed!
echo.

REM ──────────────────────────────────────────────
REM  Step 4: Wait for MySQL to be ready
REM ──────────────────────────────────────────────
echo [4/6] Waiting for MySQL to be ready...
set RETRIES=0

:wait_mysql
set /a RETRIES+=1
if %RETRIES% gtr 30 (
    echo [ERROR] MySQL did not become ready in time.
    pause
    exit /b 1
)
docker exec smis_mysql mysqladmin ping -u root -psmis_root_2024 --silent >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo        Waiting... (attempt %RETRIES%/30)
    timeout /t 2 /nobreak >nul
    goto wait_mysql
)
echo        MySQL is ready!
echo.

REM ──────────────────────────────────────────────
REM  Step 5: Run migrations and seeders
REM ──────────────────────────────────────────────
echo [5/6] Running database migrations and seeders...
cd backend
call npx sequelize-cli db:migrate
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Migration may have already been applied, continuing...
)

call npx sequelize-cli db:seed:all
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Seeds may have already been applied, continuing...
)
cd ..
echo        Database is ready!
echo.

REM ──────────────────────────────────────────────
REM  Step 6: Start Backend and Frontend
REM ──────────────────────────────────────────────
echo [6/6] Starting application servers...
echo.
echo ============================================================
echo    SMIS is starting up!
echo ============================================================
echo.
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:5000
echo    API Docs : http://localhost:5000/api/health
echo.
echo    Demo Login Credentials:
echo    ──────────────────────
echo    Admin     : admin@hilal.com   / Admin@1234
echo    Doctor    : doctor@hilal.com  / Doctor@1234
echo    Physio    : physio@hilal.com  / Physio@1234
echo    Coach     : coach@hilal.com   / Coach@1234
echo    Manager   : manager@hilal.com / Manager@1234
echo.
echo    Press Ctrl+C to stop all servers.
echo ============================================================
echo.

REM Start backend and frontend concurrently
call npm run dev

pause
