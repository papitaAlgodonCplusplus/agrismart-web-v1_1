@echo off
echo ========================================
echo AgriSmart - Complete System Startup
echo ========================================

:: Create required directories if they don't exist
echo Creating required directories...
if not exist ".\Agrismart-main\AgriSmart.Api.Agronomic\Logs" mkdir ".\Agrismart-main\AgriSmart.Api.Agronomic\Logs"
if not exist ".\Agrismart-main\AgriSmart.Api.Iot\Logs" mkdir ".\Agrismart-main\AgriSmart.Api.Iot\Logs"
if not exist ".\Agrismart-main\AgriSmart.Calculator\Logs" mkdir ".\Agrismart-main\AgriSmart.Calculator\Logs"
if not exist ".\Agrismart-main\AgriSmart.OnDemandIrrigation\Logs" mkdir ".\Agrismart-main\AgriSmart.OnDemandIrrigation\Logs"
if not exist ".\Agrismart-main\AgriSmart.AgronomicProcess\Logs" mkdir ".\Agrismart-main\AgriSmart.AgronomicProcess\Logs"

echo Directories created successfully!
echo.

:: Check if solution builds successfully
echo Building solution...
dotnet build .\Agrismart-main\AgriSmart.sln
if errorlevel 1 (
    echo Build failed! Please fix build errors before continuing.
    pause
    exit /b 1
)
echo Build completed successfully!
echo.

:: Start services in order (background processes)
echo Starting AgriSmart services...
echo.

echo [1/6] Starting AgriSmart Agronomic API (Port: 7029)...
start "Agrismart-main\AgriSmart-API-Agronomic" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.Api.Agronomic\AgriSmart.Api.Agronomic.csproj --urls https://localhost:7029"
timeout /t 3

echo [2/6] Starting AgriSmart IoT API (Port: 7030)...
start "Agrismart-main\AgriSmart-API-IoT" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.Api.Iot\AgriSmart.Api.Iot.csproj --urls https://localhost:7030"
timeout /t 3

:: echo [3/6] Starting MQTT Broker...
:: start "Agrismart-main\AgriSmart-MQTT-Broker" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.MQTTBroker\Agrismart.MQTTBroker.csproj"
:: timeout /t 3

:: echo [4/6] Starting Agronomic Process Worker...
:: start "Agrismart-main\AgriSmart-AgronomicProcess" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.AgronomicProcess\AgriSmart.AgronomicProcess.csproj"
:: timeout /t 3

:: echo [5/6] Starting Calculator Service...
:: start "Agrismart-main\AgriSmart-Calculator" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.Calculator\AgriSmart.Calculator.csproj"
:: timeout /t 3

:: echo [6/6] Starting On-Demand Irrigation Service...
:: start "Agrismart-main\AgriSmart-OnDemandIrrigation" cmd /c "dotnet run --project .\Agrismart-main\AgriSmart.OnDemandIrrigation\AgriSmart.OnDemandIrrigation.csproj"
:: timeout /t 3

echo.
echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo Service URLs:
echo - Agronomic API: https://localhost:7029
echo   Swagger UI:    https://localhost:7029/swagger
echo - IoT API:       https://localhost:7030  
echo   Swagger UI:    https://localhost:7030/swagger
echo.
echo Background Services Running:
echo - MQTT Broker
echo - Agronomic Process Worker
echo - Calculator Service  
echo - On-Demand Irrigation Service
echo.
echo To stop all services:
echo - Close all cmd windows, or
echo - Run: run-stop.bat
echo.
echo ========================================


:: python -m uvicorn main_api:app --host 0.0.0.0 --port 5002 in ./python-api folder
echo Starting Python API server...
start "python-api" cmd /c "cd python-api && python -m uvicorn main_api:app --host 0.0.0.0 --port 5002"
timeout /t 3

echo Starting ng server for frontend in current folder...
cmd /c "ng serve --open" 

echo.
echo Press any key to exit this launcher...
pause >nul