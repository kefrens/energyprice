# Launch both frontend and backend development servers

Write-Host "Starting Energy Price Development Servers..." -ForegroundColor Green
Write-Host ""

# Get the workspace root directory
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# Start backend server in a new PowerShell window
Write-Host "Launching backend server on port 3000..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit -Command `"cd '$backendDir'; npm run dev`""

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend server in a new PowerShell window
Write-Host "Launching frontend server on port 5173..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit -Command `"cd '$frontendDir'; npm run dev`""

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
