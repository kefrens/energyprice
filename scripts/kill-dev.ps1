# Kill frontend and backend development servers

Write-Host "Stopping Energy Price Development Servers..." -ForegroundColor Red
Write-Host ""

# Kill Node.js processes
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }

if ($nodeProcesses.Count -gt 0) {
    Write-Host "Killing $($nodeProcesses.Count) Node.js process(es)..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Node.js processes stopped." -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Gray
}

# Kill Vite processes (vite runs through node, but we can also target by port)
Write-Host ""
Write-Host "All development servers have been stopped." -ForegroundColor Green
