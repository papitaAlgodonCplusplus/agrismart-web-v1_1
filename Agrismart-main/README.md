# Agrismart

## How to build

dotnet nuget add source https://nuget.devexpress.com/SOME_API_KEY/api --name DevExpress
dotnet build .\AgriSmart.sln

## Common errors

> : error NU1101: Unable to find package DevExpress.Win.Design. No packages exist with this id in source(s): Microsoft Visual Studio Offline Packages, nuget.org

dotnet nuget add source "https://nuget.devexpress.com/{your_devexpress_key}/api" -n DevExpress

OR

AgriSmart.slm REMOVE

> Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "AgriSmart.Tools.Desktop", "AgriSmart.Tools.Desktop\AgriSmart.Tools.Desktop.csproj", "{D7F8FB04-EC03-4EC4-8EED-AB1BF553729A}"
EndProject


## Running each module

1. dotnet run --project .\AgriSmart.Api.Agronomic\AgriSmart.Api.Agronomic.csproj

> System.IO.DirectoryNotFoundException: Could not find a part of the path 'C:\Users\AlexQQ\Desktop\reference-repo\Agrismart-main\AgriSmart.Api.Agronomic\Logs\2025-09-02_log.txt'.

mkdir .\AgriSmart.Api.Agronomic\Logs


2. dotnet run --project .\AgriSmart.AgronomicProcess\AgriSmart.AgronomicProcess.csproj

3. dotnet run --project .\AgriSmart.Api.Iot\AgriSmart.Api.Iot.csproj

> Unhandled exception. Unhandled exception. System.ObjectDisposedException: Cannot access a disposed object.
Object name: 'IServiceProvider'.

mkdir .\AgriSmart.Api.Iot\Logs

4. Application.X are Class Libraries, not executables but utils

5. dotnet run --project .\AgriSmart.Calculator\AgriSmart.Calculator.csproj
> Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.

Copy "AgrismartApiConfiguration" from appsettings.json into appsettings.Development.json (AgriSmart.Calculator folder)

> Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.
   at AgriSmart.Calculator.WorkerCalculator..ctor(ILogger`1 logger, IOptions`1 agrismartApiConfiguration) in C:\Users\AlexQQ\Desktop\reference-repo\Agrismart-main\AgriSmart.Calculator\WorkerCalculator.cs:line 31

REVIEW: WorkerCalculator.cs // FIX ENTRY 0

> info: AgriSmart.Calculator.WorkerCalculator[0]
      Worker running at: 09/02/2025 10:27:11 -06:00
Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.
   at AgriSmart.Calculator.WorkerCalculator.ExecuteAsync(CancellationToken stoppingToken) in C:\Users\AlexQQ\Desktop\reference-repo\Agrismart-main\AgriSmart.Calculator\WorkerCalculator.cs:line 47
   at Microsoft.Extensions.Hosting.Internal.Host.StartAsync(CancellationToken cancellationToken)
   at Microsoft.Extensions.Hosting.HostingAbstractionsHostExtensions.RunAsync(IHost host, CancellationToken token)
   at Microsoft.Extensions.Hosting.HostingAbstractionsHostExtensions.RunAsync(IHost host, CancellationToken token)
   at Program.<Main>$(String[] args) in C:\Users\AlexQQ\Desktop\reference-repo\Agrismart-main\AgriSmart.Calculator\Program.cs:line 21
   at Program.<Main>(String[] args)

REVIEW: WorkerCalculator.cs // FIX ENTRY 1

6.  AgriSmart.Core is a Class Library (util)

7.  AgriSmart.DB is an SQL Project (util)

8.  AgriSmart.Infrastructure is a Class Library (util)

9. dotnet run --project .\Agrismart.MQTTBroker\Agrismart.MQTTBroker.csproj

10. dotnet run --project .\AgriSmart.OnDemandIrrigation\AgriSmart.OnDemandIrrigation.csproj

Errors in appsettings.json and CalculationCalculate, too many to document, so providing full fix instead

# Detailed Class Explanations - AgriSmart System

## Overview
AgriSmart is an agricultural management system with microservices architecture that handles crop production, IoT device management, irrigation control, and agronomic calculations.

---

## AgriSmart.AgronomicProcess

**Purpose:** Background service that processes agronomic calculations and raw data for crop production.

### Contents & Important Code:
- **Main Class:** `WorkerCalculatorP` - Background service worker
- **Key Components:**
  - `BusinessEntity` - Manages API sessions and business logic
  - `CalculationsProcess` - Handles calculation workflows
  - `CropProductionEntity` - Represents crop production data

### Most Important Functions:
```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    session = await businessEntity.CreateApiSessionAsync();
    IList<CropProductionEntity> cropProductionEntities = await businessEntity.GetCropProductionEntities(session.Token);
    await calculationsProcess.Calculate(cropProductionEntities, session.Token, stoppingToken);
}
```

### Interconnections:
- **Uses:** AgriSmart API for authentication and data
- **Consumed by:** Background task scheduler
- **Dependencies:** AgriSmart.Core entities, Infrastructure services

### Test Checklist:
- [ ] Configuration files properly loaded (AgronomicProcessConfiguration, AgrismartApiConfiguration)
- [ ] API authentication successful (session.Token not null)
- [ ] CropProductionEntities retrieved successfully
- [ ] Calculations execute without exceptions
- [ ] Logs show processing activity every 15 minutes
- [ ] Background service starts and stops cleanly

---

## AgriSmart.Api.Agronomic

**Purpose:** RESTful API exposing agronomic data and operations endpoints.

### Contents & Important Code:
- **Controllers:** Multiple controllers for different entities
  - `AnalyticalEntityController`
  - `CompanyController`
  - `CropProductionIrrigationSectorController`
  - `RelayModuleCropProductionIrrigationSectorController`

### Most Important Functions:
```csharp
[HttpGet]
public async Task<ActionResult<Response<GetAllAnalyticalEntitiesResponse>>> GetAll([FromQuery] GetAllAnalyticalEntitiesQuery query)
{
    var response = await _mediator.Send(query);
    return response.Success ? Ok(response) : BadRequest(response);
}

[HttpPost]
public async Task<ActionResult<Response<CreateAnalyticalEntityResponse>>> Post(CreateAnalyticalEntityCommand command)
{
    var response = await _mediator.Send(command);
    return response.Success ? Ok(response) : BadRequest(response);
}
```

### Interconnections:
- **Uses:** MediatR for CQRS pattern, AgriSmart.Application.Agronomic for business logic
- **Consumed by:** External clients, frontend applications, other microservices
- **Dependencies:** JWT authentication, Entity Framework, SQL Server database

### Test Checklist:
- [ ] API starts successfully on configured port
- [ ] JWT authentication works correctly
- [ ] All controller endpoints respond (GET, POST, PUT, DELETE)
- [ ] CRUD operations work for all entities
- [ ] Proper HTTP status codes returned (200, 400, 401)
- [ ] Database connections established
- [ ] Logs directory exists and logging works
- [ ] API documentation (Swagger) accessible

---

## AgriSmart.Api.Iot

**Purpose:** RESTful API for IoT device data collection and management.

### Contents & Important Code:
- **Controllers:** IoT-specific controllers for device management
- **Services:** `DeviceSensorCacheService` for caching sensor data
- **Background Services:** `DeviceSensorCacheRefreshHandler`

### Most Important Functions:
```csharp
// Device authentication and data processing
AuthenticateDeviceHandler
AddDeviceRawDataHandler
AddMqttDeviceRawDataHandler
ProcessDeviceRawDataHandler
```

### Interconnections:
- **Uses:** AgriSmart.Application.Iot, caching services, database
- **Consumed by:** IoT devices, MQTT clients, external monitoring systems
- **Dependencies:** Memory caching, background services

### Test Checklist:
- [ ] API responds to device authentication requests
- [ ] Raw device data can be submitted successfully
- [ ] MQTT device data processing works
- [ ] Device sensor cache refreshes properly
- [ ] Background services start without errors
- [ ] Database connections for IoT data storage
- [ ] Memory cache operations function correctly
- [ ] Device authentication validates properly

---

## AgriSmart.Application.Agronomic

**Purpose:** Application layer implementing CQRS pattern for agronomic business logic.

### Contents & Important Code:
- **Commands:** Create, Update, Delete operations
- **Queries:** Data retrieval operations
- **Handlers:** Process commands and queries
- **Validation:** Data validation logic

### Most Important Functions:
```csharp
// CQRS Pattern Implementation
GetAllAnalyticalEntitiesQuery/Handler
GetAnalyticalEntityByIdQuery/Handler
CreateAnalyticalEntityCommand/Handler
UpdateAnalyticalEntityCommand/Handler
```

### Interconnections:
- **Used by:** AgriSmart.Api.Agronomic controllers
- **Uses:** AgriSmart.Core entities, Infrastructure repositories
- **Dependencies:** MediatR, validation frameworks

### Test Checklist:
- [ ] All query handlers return expected data structures
- [ ] Command handlers process operations successfully
- [ ] Validation rules properly implemented
- [ ] Error handling for invalid inputs
- [ ] Response objects properly constructed
- [ ] Integration with repository layer works
- [ ] AutoMapper configurations correct (if used)

---

## AgriSmart.Application.Iot

**Purpose:** Application layer for IoT device operations using CQRS pattern.

### Contents & Important Code:
- **Commands:** Device registration, data submission
- **Queries:** Device data retrieval
- **Handlers:** IoT-specific business logic
- **Services:** Device management services

### Most Important Functions:
```csharp
// IoT-specific handlers
AuthenticateDeviceHandler
AddDeviceRawDataHandler
ProcessDeviceRawDataHandler
DeviceSensorCacheRefreshHandler
```

### Interconnections:
- **Used by:** AgriSmart.Api.Iot
- **Uses:** AgriSmart.Core IoT entities
- **Dependencies:** Caching services, data repositories

### Test Checklist:
- [ ] Device authentication logic works correctly
- [ ] Raw data processing handles various data formats
- [ ] Cache refresh operations complete successfully
- [ ] Error handling for malformed device data
- [ ] Integration with IoT repositories
- [ ] Background service operations

---

## AgriSmart.Calculator

**Purpose:** Background service for agronomic calculations and fertilizer requirements.

### Contents & Important Code:
- **Main Class:** `WorkerCalculator` - Background calculation service
- **Logic Classes:** 
  - `CalculationsProcess` - Core calculation logic
  - `BusinessEntity` - Business operations
  - `CalculationsIrrigation` - Irrigation-specific calculations

### Most Important Functions:
```csharp
public WorkerCalculator(ILogger<WorkerCalculator> logger, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration)
{
    session = calculationsProcess.CreateApiSession();
}

protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    calculationsProcess.CalculationCalculate(session.Token);
    await Task.Delay(10000, stoppingToken); // 10-second intervals
}
```

### Interconnections:
- **Uses:** AgriSmart API for data access
- **Consumed by:** System scheduler
- **Dependencies:** Configuration settings, API authentication

### Test Checklist:
- [ ] Configuration properly loaded (AgrismartApiConfiguration)
- [ ] API session creation successful
- [ ] Session token validation works
- [ ] CalculationCalculate method executes without errors
- [ ] Background service runs continuously
- [ ] 10-second delay intervals maintained
- [ ] Proper error handling for null sessions
- [ ] Logging outputs calculation activities

---

## AgriSmart.Core

**Purpose:** Core domain entities, interfaces, and business logic foundation.

### Contents & Important Code:
- **Entities:**
  - `CropProductionIrrigationSector` - Irrigation sector management
  - `AnalyticalEntity` - Analytics and reporting
  - `IrrigationRequest` - Irrigation control
  - `CropPhaseOptimal` - Growth phase optimization

### Most Important Functions:
```csharp
// Base entity pattern
public class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public int CreatedBy { get; set; }
    // Additional audit fields
}

// Core business entities
public class IrrigationRequest : BaseEntity
{
    public int CropProductionId { get; set; }
    public bool Irrigate { get; set; }
    public int IrrigationTime { get; set; }
    public DateTime? DateStarted { get; set; }
    public DateTime? DateEnded { get; set; }
}
```

### Interconnections:
- **Used by:** All other application layers
- **Dependencies:** None (pure domain layer)
- **Consumers:** API layers, Application layers, Infrastructure

### Test Checklist:
- [ ] Entity instantiation works correctly
- [ ] Property setters and getters function
- [ ] BaseEntity inheritance properly implemented
- [ ] Entity relationships defined correctly
- [ ] No circular dependencies
- [ ] Interface contracts properly defined
- [ ] Domain logic validation rules

---

## AgriSmart.DB

**Purpose:** Database project containing schema, tables, stored procedures, and data scripts.

### Contents & Important Code:
- **Scripts:**
  - `BusinessUnit_InitialData.sql` - Initial system data
  - `ClearTables.sql` - Database cleanup procedures
- **Schema:** Complete database structure for AgriSmart system

### Most Important Functions:
```sql
-- User management
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) 
VALUES (0, 1, 'ebrecha@iapsoft.com', '123', 1,1)

-- Device registration
INSERT INTO [dbo].[Device] ([CompanyId], [DeviceId],[CreatedBy]) 
VALUES ((SELECT [Id] FROM [dbo].[Company] WHERE [Name] = 'Estacion Pruebas UCR'), 'EM01UCR', 1)

-- Measurement variables
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) 
VALUES ('Contenido Volumétrico de Agua_CV',68,1)
```

### Interconnections:
- **Used by:** All application layers through Entity Framework
- **Dependencies:** SQL Server
- **Consumers:** Infrastructure repositories

### Test Checklist:
- [ ] Database schema deploys successfully
- [ ] Initial data scripts execute without errors
- [ ] All tables created with proper constraints
- [ ] Foreign key relationships established
- [ ] Stored procedures compile successfully
- [ ] Sample data populates correctly
- [ ] Database cleanup scripts work
- [ ] Connection strings configuration valid

---

## AgriSmart.Infrastructure

**Purpose:** Infrastructure services and cross-cutting concerns implementation.

### Contents & Important Code:
- **Data Context:** Entity Framework DbContext
- **Repositories:** Data access layer implementation
- **Services:** Supporting infrastructure services
- **Configuration:** System configuration management

### Most Important Functions:
```csharp
// Repository pattern implementation
public class QueryRepository : IQueryRepository
{
    private readonly AgriSmartContext _context;
    
    public QueryRepository(AgriSmartContext context)
    {
        _context = context;
    }
}

// Command repository implementation
public class CommandRepository : ICommandRepository
{
    // CRUD operations implementation
}
```

### Interconnections:
- **Used by:** Application layers
- **Uses:** AgriSmart.Core interfaces, Entity Framework
- **Dependencies:** Database context, configuration

### Test Checklist:
- [ ] DbContext initializes successfully
- [ ] Repository implementations work correctly
- [ ] Database migrations apply properly
- [ ] Configuration services load settings
- [ ] Dependency injection container setup
- [ ] Connection pooling functions correctly
- [ ] Transaction management works
- [ ] Error handling and logging

---

## AgriSmart.OnDemandIrrigation

**Purpose:** Background service for automated irrigation control and scheduling.

### Contents & Important Code:
- **Background Service:** Automated irrigation execution
- **Configuration:** Irrigation timing and control settings
- **API Integration:** Irrigation system communication

### Most Important Functions:
```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    // Validate configuration and API credentials
    // Execute irrigation logic
    // Log irrigation actions
}
```

### Interconnections:
- **Uses:** AgriSmart API, irrigation hardware APIs
- **Consumed by:** System scheduler
- **Dependencies:** Hardware integration, configuration

### Test Checklist:
- [ ] Configuration validation successful
- [ ] API credentials authentication works
- [ ] Background service starts properly
- [ ] Irrigation logic executes correctly
- [ ] Hardware communication functional
- [ ] Logging captures irrigation events
- [ ] Error handling for hardware failures
- [ ] Scheduling intervals respected

---

## AgriSmart.Tools.Desktop

**Purpose:** Windows Forms desktop application for agronomic data management and visualization.

### Contents & Important Code:
- **Forms:**
  - `SubFrmWater` - Water management interface
  - `SubFrmFertilizerInputs` - Fertilizer input management
  - `FrmSelectFertilizer` - Fertilizer selection dialog
  - `FrmInputPresentations` - Input presentation management

### Most Important Functions:
```csharp
// Desktop application logic for irrigation calculations
public class IrrigationDesignCalculationsForCropProductionSoil
{
    private double getRequiredNumberOfDropperPerM2()
    {
        return 1 / input.BetweenDropperDistance * getBetweenLateralsDistance();
    }
    
    private double getPrecipitationFlowM2Hour()
    {
        return input.cropProductionSoil.Dropper.FlowRate / (getBetweenLateralsDistance() * input.BetweenDropperDistance);
    }
}
```

### Interconnections:
- **Uses:** AgriSmart APIs for data access
- **Dependencies:** DevExpress UI components, .NET Framework
- **Consumers:** Desktop users, agronomists

### Test Checklist:
- [ ] Application launches successfully
- [ ] All forms load without errors
- [ ] Data entry validation works
- [ ] Calculation results display correctly
- [ ] API communication functional
- [ ] DevExpress controls render properly
- [ ] User actions update data correctly
- [ ] Form navigation works smoothly
- [ ] Error messages display appropriately

---

## Agrismart.MQTTBroker

**Purpose:** MQTT broker for IoT device communication and message routing.

### Contents & Important Code:
- **Models:**
  - `IotClient` - MQTT client representation
- **Broker Logic:** MQTT message routing and device management

### Most Important Functions:
```csharp
public record IotClient
{
    public string ClientId { get; set; }
    public string EndPoint { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
}
```

### Interconnections:
- **Used by:** IoT devices, sensor networks
- **Uses:** MQTT protocol libraries
- **Dependencies:** Network communication, device authentication

### Test Checklist:
- [ ] MQTT broker starts successfully
- [ ] Device connections established
- [ ] Message routing works correctly
- [ ] Client authentication functional
- [ ] Topic subscriptions work
- [ ] Message persistence (if configured)
- [ ] Network connectivity handling
- [ ] Device disconnection handling
- [ ] Broker logs capture activities

---

## OnDemandIrrigation

**Purpose:** Additional irrigation control services and logic.

### Contents & Important Code:
- **Irrigation Logic:** Scheduling and execution algorithms
- **Control Systems:** Hardware interface implementations

### Interconnections:
- **Works with:** AgriSmart.OnDemandIrrigation
- **Uses:** Irrigation hardware APIs
- **Dependencies:** System configuration

### Test Checklist:
- [ ] Irrigation requests processed correctly
- [ ] Hardware commands executed successfully
- [ ] Scheduling logic functions properly
- [ ] Integration with main irrigation service
- [ ] Error handling for hardware failures
- [ ] Status reporting works

---

## System Integration Test Checklist

### Overall System Tests:
- [ ] All services start in correct order
- [ ] Inter-service communication works
- [ ] Database connectivity across all modules
- [ ] API authentication flows function
- [ ] MQTT broker handles device connections
- [ ] Background services run continuously
- [ ] Desktop application connects to APIs
- [ ] Irrigation systems respond to commands
- [ ] Logging works across all components
- [ ] Error handling and recovery mechanisms
- [ ] Configuration loading from all sources
- [ ] Performance under expected load

### Data Flow Tests:
- [ ] IoT data flows from devices → MQTT → API → Database
- [ ] Agronomic calculations trigger properly
- [ ] Irrigation commands execute end-to-end
- [ ] Desktop tools can read/write data
- [ ] Background processes don't interfere with APIs
- [ ] Cache refresh operations work correctly