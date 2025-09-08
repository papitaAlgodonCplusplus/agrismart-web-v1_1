# Skip SSL certificate validation for localhost development
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Set up headers with UTF-8 charset
$headers = @{
    'accept' = 'text/plain'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiY3NvbGFub0BpYXBjci5jb20iLCJqdGkiOiI2NWEzYWNiYy02NmZkLTQ3YzAtODEzNy0xZjBjM2JlZmFmYmQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3ByaW1hcnlzaWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiMSIsImV4cCI6MTc1NzI5ODUzNiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo3MDI5IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAwIn0.8dOdWDL-rY82_EgMP4Aw0qn5ffG2_DFWs52mW4igVxU'
    'Content-Type' = 'application/json; charset=utf-8'
}

# JSON body as raw string (using here-string @'...'@)
$body = @'
{
    "id": 0,
    "catalogId": 7,
    "name": "Monitoreo Climático General",
    "description": "Vista general de variables climáticas principales incluyendo temperatura, humedad y radiación",
    "summaryTimeScale": "hour",
    "yAxisScaleType": "auto",
    "series": "[[{\"geomtype\":\"Line\",\"measurementVariableId\":50,\"axis\":\"Primary\",\"color\":\"#FF4444\",\"visible\":true,\"createStats\":true,\"line_width\":0.8,\"line_type\":\"solid\",\"line_Transparency\":1}],[{\"geomtype\":\"Line\",\"measurementVariableId\":51,\"axis\":\"Secondary\",\"color\":\"#4444FF\",\"visible\":true,\"createStats\":true,\"line_width\":0.8,\"line_type\":\"solid\",\"line_Transparency\":1}],[{\"geomtype\":\"Point\",\"measurementVariableId\":52,\"axis\":\"Primary\",\"color\":\"#44FF44\",\"visible\":true,\"createStats\":false,\"shape_type\":16,\"shape_fill_color\":\"#44FF44\",\"shape_size\":2,\"point_transparency\":0.8}]]",
    "active": true
}
'@

# Convert string to UTF-8 bytes to handle special characters properly
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

# Make the API request
Invoke-RestMethod -Uri 'https://localhost:7029/Graph' -Method Post -Headers $headers -Body $bodyBytes