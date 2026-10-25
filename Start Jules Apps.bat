@echo off
title Jules Apps
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b)
rem Extra options pass through, e.g. --open=#sie opens the SIE Study tab
node server.js %*
pause
