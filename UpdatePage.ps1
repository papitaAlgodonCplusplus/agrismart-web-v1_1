
# ============================================================
# OPTION 2: Transfer Updated Files from Local Machine
# ============================================================

# ON YOUR LOCAL MACHINE (Windows):
# ---------------------------------

# Step 1: Build locally first to test
# cd C:\Path\To\Your\Local\Agrismart-main
# npm install
# ng build --configuration=production

# Step 2: Compress the project (excluding node_modules and dist)
# Compress-Archive -Path "C:\Path\To\Your\Local\Agrismart-main\*" -DestinationPath "C:\Temp\agrismart-update.zip" -Force -Exclude node_modules,dist,.git,*.log

# Step 3: Transfer to server via RDP or PowerShell
# Option A: Copy via RDP - Just drag and drop
# Option B: Use PowerShell remoting (if enabled):
<#
$session = New-PSSession -ComputerName 163.178.171.146 -Credential (Get-Credential)
Copy-Item -Path "C:\Temp\agrismart-update.zip" -Destination "C:\Temp\" -ToSession $session
Remove-PSSession $session
#>

# ON THE SERVER (163.178.171.146):
# ---------------------------------

# Step 1: Stop IIS site
Stop-WebSite -Name "AgriSmartWeb"

# Step 2: Backup current deployment
#$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
#Compress-Archive -Path "C:\inetpub\wwwroot\agrismart-web\agrismart-web-v1_1\*" -DestinationPath "C:\Backups\agrismart-web\agrismart-web-v1_1\backup-$timestamp.zip" -Force

# Step 3: Extract new code
#Expand-Archive -Path "C:\Temp\agrismart-update.zip" -DestinationPath "C:\inetpub\wwwroot\agrismart-web\agrismart-web-v1_1" -Force

# Step 4: Install dependencies
cd C:\inetpub\wwwroot\agrismart-web\agrismart-web-v1_1
npm install

# Step 5: Build for production
ng build --configuration=production

# Step 6: Copy web.config
$webConfig | Out-File -FilePath "C:\inetpub\wwwroot\agrismart-web\agrismart-web-v1_1\dist\agrismart-web-v1-1\web.config" -Encoding UTF8

# Step 7: Start site
Start-WebSite -Name "AgriSmartWeb"
iisreset