# Run database migrations using Prisma

Write-Host "Running Database Migrations..." -ForegroundColor Green
Write-Host ""

# Get the workspace root directory
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backendDir = Join-Path $rootDir "backend"

# Navigate to backend directory
Push-Location $backendDir

try {
    Write-Host "Executing: npx prisma migrate deploy" -ForegroundColor Cyan
    Write-Host ""
    
    # Run the migration command
    & npx prisma migrate deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Database migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Database migrations completed with exit code: $LASTEXITCODE" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error running migrations: $_" -ForegroundColor Red
}
finally {
    Pop-Location
}
