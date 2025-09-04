
@echo off
REM Build solutions
REM echo Building Agrismart Admin UI...
REM dotnet build "Agrismart-admin-main\Agrismart.Agronomic.UI.sln"

echo Building Agrismart Main Solution...
dotnet build "Agrismart-main\AgriSmart.sln"

REM Run Admin UI
echo Starting Agrismart Admin UI...
start cmd /k "cd /d Agrismart-admin-main\Agrismart.Agronomic.UI && dotnet run"

REM Run API projects
echo Starting AgriSmart.Api.Agronomic...
start cmd /k "cd /d Agrismart-main\AgriSmart.Api.Agronomic && dotnet run"

echo Starting AgriSmart.Api.Iot...
start cmd /k "cd /d Agrismart-main\AgriSmart.Api.Iot && dotnet run"

REM echo Starting AgriSmart.Tools.Desktop...
REM start cmd /k "cd /d Agrismart-main\AgriSmart.Tools.Desktop && dotnet run"

echo All services started in separate windows. Check each window for URLs and status.