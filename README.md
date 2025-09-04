# APIs

# AgriSmart .NET Backend API Endpoints Reference

## Base URLs
- **Agronomic API**: `localhost:7029` (or your configured port)
- **IoT API**: `localhost:7030` (or your configured port)

## Authentication Endpoints
### AuthenticationController (Agronomic API)
- **POST** `/Authentication/Login` - User login
  ```
  POST localhost:7029/Authentication/Login
  Body: {
    "userEmail": "user@example.com",
    "password": "password"
  }
  ```

---

## AgriSmart.Api.Agronomic Controllers

### 1. AnalyticalEntityController
- **GET** `/AnalyticalEntity` - Get all analytical entities (requires auth)
- **GET** `/AnalyticalEntity/{id}` - Get analytical entity by ID (requires auth)
- **POST** `/AnalyticalEntity` - Create analytical entity (requires auth)

### 2. CompanyController
- **GET** `/Company` - Get all companies
- **GET** `/Company/GetById?Id={id}` - Get company by ID
- **POST** `/Company` - Create company
- **PUT** `/Company` - Update company

### 3. CropController
- **GET** `/Crop` - Get all crops
- **GET** `/Crop/{id}` - Get crop by ID

### 4. CropProductionDeviceController
- **GET** `/CropProductionDevice` - Get all crop production devices (requires auth)
- **POST** `/CropProductionDevice` - Create crop production device (requires auth)
- **PUT** `/CropProductionDevice` - Update crop production device (requires auth)
- **DELETE** `/CropProductionDevice` - Delete crop production device (requires auth)

### 5. CropProductionIrrigationSectorController
- **GET** `/CropProductionIrrigationSector` - Get all irrigation sectors
- **GET** `/CropProductionIrrigationSector/{id}` - Get irrigation sector by ID
- **POST** `/CropProductionIrrigationSector` - Create irrigation sector
- **PUT** `/CropProductionIrrigationSector` - Update irrigation sector

### 6. DeviceController
- **GET** `/Device` - Get all devices (requires auth)
- **POST** `/Device` - Create device (requires auth)
- **PUT** `/Device` - Update device (requires auth)

### 7. FarmController
- **GET** `/Farm` - Get all farms (requires auth)
- **GET** `/Farm/{id}` - Get farm by ID (requires auth)
- **POST** `/Farm` - Create farm (requires auth)
- **PUT** `/Farm` - Update farm (requires auth)

### 8. LicenseController
- **GET** `/License` - Get all licenses (requires auth)
- **GET** `/License/{id}` - Get license by ID (requires auth)
- **POST** `/License` - Create license (requires super admin role)
- **PUT** `/License` - Update license (requires super admin role)

### 9. ProductionUnitController
- **GET** `/ProductionUnit` - Get all production units (requires auth)
- **GET** `/ProductionUnit/{id}` - Get production unit by ID (requires auth)
- **POST** `/ProductionUnit` - Create production unit (requires auth)
- **PUT** `/ProductionUnit` - Update production unit (requires auth)

### 10. RelayModuleCropProductionIrrigationSectorController
- **GET** `/RelayModuleCropProductionIrrigationSector` - Get all relay modules
- **POST** `/RelayModuleCropProductionIrrigationSector` - Create relay module
- **DELETE** `/RelayModuleCropProductionIrrigationSector` - Delete relay module

### 11. UserController
- **GET** `/User` - Get all users
- **POST** `/User` - Create user
- **PUT** `/User` - Update user
- **PUT** `/User/Password` - Update user password

### 12. UserFarmController
- **GET** `/UserFarm` - Get all user farms
- **POST** `/UserFarm` - Create user farm
- **DELETE** `/UserFarm` - Delete user farm

### 13. WaterChemistryController
- **GET** `/WaterChemistry` - Get all water chemistries
- **GET** `/WaterChemistry/{id}` - Get water chemistry by ID
- **POST** `/WaterChemistry` - Create water chemistry
- **PUT** `/WaterChemistry` - Update water chemistry

---

## AgriSmart.Api.Iot Controllers

### 1. DeviceRawDataController
- **POST** `/DeviceRawData` - Add raw device data
  ```
  POST localhost:7030/DeviceRawData
  Body: {
    "deviceId": "device123",
    "sensorData": {...}
  }
  ```
- **POST** `/DeviceRawData/Mqtt` - Add MQTT raw device data
- **POST** `/DeviceRawData/ProcessRawData` - Process raw device data

### 2. SecurityController
- **POST** `/Security/AuthenticateDevice` - Authenticate IoT device
  ```
  POST localhost:7030/Security/AuthenticateDevice
  Body: {
    "deviceId": "device123",
    "clientId": "client456"
  }
  ```
- **POST** `/Security/AuthenticateMqttConnection` - Authenticate MQTT connection

---

## Additional Endpoints from Configuration

Based on the frontend configuration, these additional endpoints are likely available:

### Client Management
- **GET/POST/PUT/DELETE** `/Client` - Client operations

### Farm Management Extended
- **GET/POST/PUT/DELETE** `/ProductionUnitType` - Production unit types
- **GET/POST/PUT/DELETE** `/CropPhase` - Crop phases
- **GET/POST/PUT/DELETE** `/GrowingMedium` - Growing mediums

### Sensor Management
- **GET/POST/PUT/DELETE** `/Sensor` - Sensor operations
- **GET/POST/PUT/DELETE** `/MeasurementVariable` - Measurement variables
- **GET/POST/PUT/DELETE** `/MeasurementVariableStandard` - Measurement standards
- **GET/POST/PUT/DELETE** `/MeasurementUnit` - Measurement units

### Crop Production Extended
- **GET/POST/PUT/DELETE** `/CropProduction` - Crop production operations
- **GET/POST/PUT/DELETE** `/CropProductionIrrigationSector` - Irrigation sectors
- **GET/POST/PUT/DELETE** `/Dropper` - Dropper management

### Catalog & Container Management
- **GET/POST/PUT/DELETE** `/Catalog` - Catalog operations
- **GET/POST/PUT/DELETE** `/Container` - Container management
- **GET/POST/PUT/DELETE** `/ContainerType` - Container types

### Fertilizer Management
- **GET/POST/PUT/DELETE** `/Fertilizer` - Fertilizer operations
- **GET/POST/PUT/DELETE** `/FertilizerChemistry` - Fertilizer chemistry
- **GET/POST/PUT/DELETE** `/FertilizerInput` - Fertilizer inputs

### Water Management
- **GET/POST/PUT/DELETE** `/Water` - Water management
- **GET/POST/PUT/DELETE** `/WaterChemistry` - Water chemistry (already listed above)

### System Configuration
- **GET/POST/PUT/DELETE** `/CalculationSetting` - Calculation settings
- **GET/POST/PUT/DELETE** `/CropPhaseOptimal` - Optimal crop phases
- **GET/POST/PUT/DELETE** `/RelayModule` - Relay modules
- **GET/POST/PUT/DELETE** `/TimeZone` - Time zone settings

### Profile & User Management Extended
- **GET/POST/PUT/DELETE** `/Profile` - User profiles
- **GET/POST/PUT/DELETE** `/UserStatus` - User status management

---

## API Response Format

All endpoints return responses in this format:
```json
{
  "success": true/false,
  "result": { ... },
  "message": "Success/Error message",
  "errors": []
}
```

## Authentication

- Most endpoints require JWT authentication
- Include `Authorization: Bearer {token}` header
- Login endpoint returns JWT token
- Some endpoints require specific roles (e.g., super admin for license management)

## Example API Calls

### Login
```bash
curl -X POST "localhost:7029/Authentication/Login" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@example.com",
    "password": "password123"
  }'
```

### Get All Farms (with auth)
```bash
curl -X GET "localhost:7029/Farm" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Device
```bash
curl -X POST "localhost:7029/Device" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sensor Device 1",
    "deviceId": "DEV001",
    "farmId": 1
  }'
```

### Submit IoT Data
```bash
curl -X POST "localhost:7030/DeviceRawData" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV001",
    "recordDate": "2024-01-01T00:00:00Z",
    "sensorData": {...}
  }'
```