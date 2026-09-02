@echo off
title Launching SOS Payroll & Tax...
start msedge.exe --app="https://chickeringguycell-dotcom.github.io/sos-payroll-app/app.html?v=live" --window-size=1280,850
if %ERRORLEVEL% NEQ 0 (
    start chrome.exe --app="https://chickeringguycell-dotcom.github.io/sos-payroll-app/app.html?v=live" --window-size=1280,850
)
if %ERRORLEVEL% NEQ 0 (
    start "" "https://chickeringguycell-dotcom.github.io/sos-payroll-app/app.html?v=live"
)
exit

