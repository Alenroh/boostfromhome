@echo off
title Jules Apps
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b)
rem Worldbuilder now opens inside Jules Apps, together with Boost and SIE Study.
rem To run Worldbuilder completely on its own instead, use: node server.js
node "..\..\server.js" --open=#world
pause
