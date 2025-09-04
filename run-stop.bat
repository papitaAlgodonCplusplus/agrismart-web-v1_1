@echo off
echo ========================================
echo AgriSmart - Stopping All Services
echo ========================================

echo Stopping all AgriSmart services...

:: Kill all dotnet processes related to AgriSmart
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-API-Agronomic*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-API-IoT*" 2>nul  
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-MQTT-Broker*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-AgronomicProcess*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-Calculator*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Agrismart-main\AgriSmart-OnDemandIrrigation*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Agrismart-Frontend*" 2>nul

:: Alternative method - kill by process name if window titles don't work
echo Killing any remaining dotnet processes on AgriSmart ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7029') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :7030') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do taskkill /f /pid %%a 2>nul

echo.
echo All AgriSmart services stopped successfully!
echo.

pause