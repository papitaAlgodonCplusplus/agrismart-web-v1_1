## 1. CALCULUS FUNCTIONS
*Functions that calculate data, generate outputs, or make decisions*

### IrrigationPlanHelper.cs
- `GetIrrigationRequest` - Determines if irrigation should occur based on schedule
- `GetBitForDay` - Converts day of week to bit position
- `IsDayEnabled` - Checks if irrigation is enabled for a specific day
- `NormalizeTimeSpanTo24h` - Normalizes TimeSpan to 24-hour period
- `IsTimeInRangeConsideringMidnight` - Checks time in range with midnight handling
- `ComposeOccurrenceDateTime` - Creates DateTime for irrigation occurrence
- `ComposeOccurrenceDateTimeConsideringMidnight` - Creates DateTime for repeating occurrence
- `IsTimeInRange` - Simple time range check

### IrrigationMonitor.cs (Main System)
- `getIrrigationSpan` - Calculates irrigation duration in seconds
- `ToIrrigate` - Calculates if irrigation is needed based on humidity and thresholds
- `IsRelayActive` - Checks if relay is active

### IrrigationEventProcess.cs
- `GetCropProductionIrrigationEvents` - Detects irrigation events from pressure readings
- `GetIrrigationEventsVolumes` - Calculates irrigation and drain volumes

### CalculationsIrrigation.cs
- `GetIrrigationMetrics` - Retrieves and calculates irrigation metrics for specific date
- `getIrrigationMeasurementEntity` - Creates irrigation measurement entity
- `CalculateIrrigationCalculationOutputP` - Legacy comprehensive irrigation metrics calculation
- `CalculateIrrigationCalculationOutput` (2 versions) - Current comprehensive irrigation metrics calculation
- `GetMeasurementValue` - Retrieves sum of measurement values
- `AddIrrigationIntervalMeasurement` - Calculates time interval between irrigations
- `AddIrrigationLengthMeasurement` - Calculates duration of irrigation event
- `GetDensities` - Calculates container and plant densities per m²
- `AddIrrigationVolumes` - Calculates irrigation volume measurements
- `AddDrainVolumes` - Calculates drain volume measurements
- `AddIrrigationFlow` - Calculates irrigation flow rate
- `AddIrrigationPrecipitation` - Calculates irrigation precipitation rate
- `AddMeasurement` - Helper to add measurement to event

### GlobalOutput.cs
- `getIrrigationIntervalStats` - Calculates statistical metrics for intervals
- `getIrrigationLengthStats` - Calculates statistical metrics for durations
- `getIrrigationVolumenSum` - Calculates total irrigation volumes
- `getIrrigationVolumenMin` - Returns minimum irrigation volume
- `getIrrigationVolumenMax` - Returns maximum irrigation volume
- `getIrrigationVolumenAvg` - Calculates average irrigation volume

### Calculations.cs
- *Uses irrigation metrics to calculate crop evapotranspiration* - Combines irrigation volume, drain volume, and volumetric water content changes

**Total Calculus Functions: 38**

---

## 2. API FUNCTIONS
*Functions that interact with the database via GET, POST, PUT, DELETE operations*

### Command Handlers (POST/PUT/DELETE operations)

#### IrrigationPlan Operations
- `CreateIrrigationPlanHandler.Handle` - POST: Creates new irrigation plan
- `UpdateIrrigationPlanHandler.Handle` - PUT: Updates existing irrigation plan

#### IrrigationPlanEntry Operations
- `CreateIrrigationPlanEntryHandler.Handle` - POST: Creates new irrigation plan entry
- `UpdateIrrigationPlanEntryHandler.Handle` - PUT: Updates existing irrigation plan entry

#### IrrigationEvent Operations
- `CreateIrrigationEventHandler.Handle` - POST: Creates new irrigation event with measurements

#### CropProductionIrrigationSector Operations
- `CreateCropProductionIrrigationSectorHandler.Handle` - POST: Creates new irrigation sector
- `UpdateCropProductionIrrigationSectorHandler.Handle` - PUT: Updates existing irrigation sector

#### CropProductionIrrigationRequest Operations
- `CreateCropProductionIrrigationRequestHandler.Handle` - POST: Creates new irrigation request
- `UpdateCropProductionIrrigationRequestHandler.Handle` - PUT: Updates existing irrigation request

#### RelayModule Operations
- `CreateRelayModuleCropProductionIrrigationSectorHandler.Handle` - POST: Creates new relay module irrigation sector
- `DeleteRelayModuleCropProductionIrrigationSectorHandler.Handle` - DELETE: Deletes relay module irrigation sector

### Query Handlers (GET operations)

#### IrrigationPlan Queries
- `GetAllIrrigationPlansHandler.Handle` - GET: Retrieves all irrigation plans
- `GetIrrigationPlanByIdHandler.Handle` - GET: Retrieves specific irrigation plan by ID

#### IrrigationPlanEntry Queries
- `GetAllIrrigationPlanEntriesHandler.Handle` - GET: Retrieves all irrigation plan entries
- `GetIrrigationPlanEntryByIdHandler.Handle` - GET: Retrieves specific plan entry by ID

#### IrrigationEvent Queries
- `GetAllIrrigationEventsHandler.Handle` - GET: Retrieves all irrigation events in date range

#### IrrigationMeasurement Queries
- `GetAllIrrigationMeasurementsHandler.Handle` - GET: Retrieves all irrigation measurements in date range

#### IrrigationSector Queries
- `GetAllCropProductionIrrigationSectorsHandler.Handle` - GET: Retrieves all irrigation sectors

#### IrrigationRequest Queries
- `GetAllCropProductionIrrigationRequestsHandler.Handle` - GET: Retrieves all irrigation requests
- `GetCropProductionIrrigationRequestByIdHandler.Handle` - GET: Retrieves specific irrigation request by ID

#### RelayModule Queries
- `GetAllRelayModuleCropProductionIrrigationSectorsHandler.Handle` - GET: Retrieves all relay module irrigation sectors

### API Client Interface (IAgriSmartApiClient.cs)
- `GetIrrigationMeasurements` - GET: irrigation measurements
- `GetIrrigationEvents` - GET: irrigation events
- `CreateIrrigationEvent` - POST: new irrigation event
- `GetIrrigationPlan` - GET: irrigation plan by ID
- `GetIrrigationPlanEntries` - GET: irrigation plan entries
- `CreateCropProductionIrrigationRequest` - POST: irrigation request
- `GetAllCropProductionIrrigationRequests` - GET: irrigation requests

### API Client Implementation (AgriSmartApiClient.cs)
- `GetIrrigationEvents` - GET: irrigation events from API
- `GetIrrigationMeasurements` - GET: irrigation measurements from API
- `GetCropProductionIrrigationSector` - GET: irrigation sector data (2 versions)
- `GetCropProductions` - GET: all crop productions

### Repository Functions - Command Operations

#### IIrrigationEventCommandRepository
- `CreateAsync` - POST: Creates new irrigation event record

#### ICropProductionIrrigationRequestCommandRepository
- `CreateAsync` - POST: Creates new irrigation request

#### Base Command Repository Implementations
- `IIrrigationPlanCommandRepository` - CRUD operations for irrigation plans
- `IIrrigationPlanEntryCommandRepository` - CRUD operations for irrigation plan entries
- `ICropProductionIrrigationSectorCommandRepository` - CRUD operations for irrigation sectors
- `IRelayModuleCropProductionIrrigationSectorCommandRepository` - CRUD operations for relay module mappings

### Repository Functions - Query Operations

#### IIrrigationPlanQueryRepository
- `GetAllAsync` - GET: all irrigation plans
- `GetByIdAsync` - GET: irrigation plan by ID

#### IIrrigationPlanEntryQueryRepository
- `GetAllAsync` - GET: all irrigation plan entries
- `GetByIdAsync` - GET: irrigation plan entry by ID

#### IIrrigationMeasurementQueryRepository
- `GetAllAsync` - GET: all irrigation measurements in date range

#### IIrrigationEventQueryRepository
- `GetAllAsync` - GET: all irrigation events in date range

#### ICropProductionIrrigationSectorQueryRepository
- `GetAllAsync` - GET: all irrigation sectors with filters
- `GetByIdAsync` - GET: irrigation sector by ID

#### ICropProductionIrrigationRequestQueryRepository
- `GetAllAsync` - GET: all irrigation requests with filters
- `GetByIdAsync` - GET: irrigation request by ID

### Additional API Operations
- `IrrigationEventProcess.SaveIrrigationEvents` - POST: Saves irrigation events via API
- `IrrigationEventProcess.GetIrrigationEvents` - GET: Retrieves/calculates events via API

**Total API Functions: 57**

---

## 3. OTHERS
*Orchestration, workflow, control, and infrastructure functions*

### Background Workers & Orchestration

#### WorkerOnDemandIrrigation.cs
- `ExecuteAsync` - Background service running at 1-minute intervals
- `RunIteration` - Executes one iteration of monitoring process

#### OnDemandIrrigationProcess.cs
- `Calculation` - Empty implementation with entity conversion (2 versions)
- `CalculationCalculate` - Orchestrates complete irrigation calculation process
- `CreateApiSession` - Creates API session with authentication

#### CalculationsProcess.cs
- *Irrigation-related orchestration operations* - Retrieves irrigation events/measurements and builds data collection for calculations

### Irrigation Control & Monitoring

#### IrrigationController.cs
- `IrrigationController` (Constructor) - Initializes controller with requests
- `StartIrrigation` - Starts irrigation process
- `StopIrrigation` - Stops irrigation process
- `notAllRequestDone` - Checks for undone requests
- `SendSetOnSignal` - Sends relay activation signal (empty)

#### IrrigationMonitor.cs (Orchestration methods)
- `SetCropProductionsToIrrigate` - Main orchestrator for irrigation triggering
- `SetCropProductionsToIrrigateFromPlan` - Handles plan-based irrigation orchestration
- `SetCropProductionsToIrrigateOnDemand` - Handles on-demand irrigation orchestration
- `SetIrrigationMetrics` - Prepares inputs for metric calculations (incomplete)

### OnDemand Irrigation Management

#### OnDemandIrrigation.cs
- `OnDemandIrrigation` (Constructor) - Initializes on-demand system
- `Run` - Main execution method for processing crop productions

### Data Transfer Objects & Entities

#### IrrigationRequest.cs
- `IrrigationRequest` (Constructor) - Creates irrigation request object

#### IrrigationMonitorResponse.cs
- Data structure with properties: `Irrigate` (bool), `IrrigationTime` (int)

#### IrrigationEventEntity.cs
- `AddIrrigationMeasurement` - Instance method to add measurement to event

**Total Other Functions: 20**

---

## SUMMARY STATISTICS

| Category | Count | Percentage |
|----------|-------|------------|
| **CALCULUS FUNCTIONS** | 38 | 33% |
| **API FUNCTIONS** | 57 | 50% |
| **OTHERS** | 20 | 17% |
| **TOTAL** | **115** | **100%** |

### Breakdown by Subcategory:

**CALCULUS:**
- Time/Schedule Calculations: 8
- Irrigation Decision Logic: 4
- Event Detection & Volume Calculations: 2
- Irrigation Metrics & Statistics: 18
- Density & Conversion Calculations: 2
- Helper/Support Functions: 4

**API:**
- Command Handlers (Create/Update/Delete): 11
- Query Handlers (Read): 10
- API Client Methods: 11
- Repository Functions: 23
- Additional API Operations: 2

**OTHERS:**
- Background Workers: 2
- Orchestration/Process Management: 6
- Control & Monitoring: 9
- Data Structures & Constructors: 3

# Irrigation and OnDemandIrrigation Functions

## OnDemandIrrigationProcess.cs

### Calculation
- **Input:** `IList<CropProduction> cropProductions`, `string token`, `CancellationToken ct`
- **Output:** `void`
- **Summary:** Processes crop productions for on-demand irrigation calculations. Currently contains empty implementation with entity conversion.

---

## WorkerOnDemandIrrigation.cs

### ExecuteAsync
- **Input:** `CancellationToken stoppingToken`
- **Output:** `Task`
- **Summary:** Background service that runs periodic irrigation monitoring at 1-minute intervals. Orchestrates the on-demand irrigation process.

### RunIteration
- **Input:** `CancellationToken stoppingToken`
- **Output:** `Task`
- **Summary:** Executes one iteration of the on-demand irrigation monitoring process. Creates API session, retrieves crop productions, and triggers irrigation monitoring.

---

## IrrigationPlanHelper.cs

### GetIrrigationRequest
- **Input:** `IrrigationPlanEntity plan`, `DateTime currentDate`, `double toleranceMinutes = 1.0`
- **Output:** `CropProductionIrrigationRequest`
- **Summary:** Determines whether irrigation should occur based on an irrigation plan schedule. Evaluates day masks, time windows, and repeat intervals to decide if current time matches any scheduled irrigation.

### GetBitForDay
- **Input:** `DayOfWeek day`
- **Output:** `int`
- **Summary:** Converts a day of week to a bit position for day mask calculations (Monday=1, Sunday=64).

### IsDayEnabled
- **Input:** `int daysMask`, `DateTime date`
- **Output:** `bool`
- **Summary:** Checks if irrigation is enabled for a specific day based on the days mask in the plan.

### NormalizeTimeSpanTo24h
- **Input:** `TimeSpan ts`
- **Output:** `TimeSpan`
- **Summary:** Normalizes a TimeSpan to fall within a 24-hour period (0-24 hours).

### IsTimeInRangeConsideringMidnight
- **Input:** `TimeSpan value`, `TimeSpan start`, `TimeSpan end`
- **Output:** `bool`
- **Summary:** Checks if a time falls within a range, handling cases where the range crosses midnight.

### ComposeOccurrenceDateTime
- **Input:** `DateTime currentDate`, `TimeSpan startTime`
- **Output:** `DateTime`
- **Summary:** Creates a DateTime for an irrigation occurrence, adjusting for midnight crossings within a 12-hour window.

### ComposeOccurrenceDateTimeConsideringMidnight
- **Input:** `DateTime currentDate`, `TimeSpan wStart`, `long n`, `int intervalMinutes`, `bool crossesMidnight`
- **Output:** `DateTime`
- **Summary:** Creates a DateTime for a repeating irrigation occurrence, handling midnight-crossing windows and repeat intervals.

### IsTimeInRange
- **Input:** `TimeSpan value`, `TimeSpan start`, `TimeSpan end`
- **Output:** `bool`
- **Summary:** Simple check if a time value falls within a start and end time range (no midnight handling).

---

## IrrigationMonitor.cs

### SetCropProductionsToIrrigate
- **Input:** `IList<CropProductionEntity> cropProductions`, `string token`, `CancellationToken ct`
- **Output:** `Task<bool>`
- **Summary:** Main orchestrator that iterates through crop productions and triggers appropriate irrigation method based on irrigation mode (Manual=1, Plan=2, OnDemand=3).

### SetCropProductionsToIrrigateFromPlan
- **Input:** `string token`, `CropProductionEntity cropProduction`
- **Output:** `Task<bool>`
- **Summary:** Handles plan-based irrigation. Retrieves irrigation plan, evaluates current time against schedule, checks soil moisture, and creates irrigation request if conditions are met.

### getIrrigationSpan
- **Input:** `CropProductionEntity cropProduction`
- **Output:** `int`
- **Summary:** Calculates irrigation duration in seconds based on flow rate, container volume, available water percentage, and depletion/drain thresholds.

### SetCropProductionsToIrrigateOnDemand
- **Input:** `string token`, `CropProductionEntity cropProduction`
- **Output:** `Task`
- **Summary:** Handles on-demand irrigation based on soil moisture readings and previous irrigation drain percentage. Adjusts irrigation volume based on drain performance and creates irrigation request.

---

## IrrigationEventProcess.cs

### SaveIrrigationEvents
- **Input:** `IList<IrrigationEvent> irrigationEvents`, `string token`
- **Output:** `Task<bool>`
- **Summary:** Saves a list of irrigation events to the API by iterating and creating each event.

### GetCropProductionIrrigationEvents
- **Input:** `CropProductionEntity cropProduction`, `IList<CalculationSetting> calculationSettings`, `IrrigationEvent inProgressIrrigationEvent`, `IList<MeasurementBase> readings`
- **Output:** `IList<IrrigationEvent>`
- **Summary:** Detects irrigation events from pipeline pressure readings by identifying pressure increases (pump on) and decreases (pump off) that exceed delta threshold.

### GetIrrigationEventsVolumes
- **Input:** `IList<IrrigationEvent> irrigationEvents`, `IList<MeasurementBase> waterInputs`, `IList<MeasurementBase> waterDrains`, `IList<CalculationSetting> calculationSettings`, `DateTime localTime`
- **Output:** `IList<IrrigationEvent>`
- **Summary:** Calculates irrigation and drain volumes for each event by analyzing water input and drain sensor readings during the event time window.

### GetIrrigationEvents
- **Input:** `CropProductionEntity cropProduction`, `IList<CalculationSetting> calculationSettings`, `string token`
- **Output:** `Task<IList<IrrigationEvent>>`
- **Summary:** Main method to retrieve and calculate all irrigation events for a crop production. Fetches pressure, input, and drain measurements, detects events, and calculates volumes.

---

## CalculationsIrrigation.cs

### SetIrrigationMetrics
- **Input:** `List<IrrigationEventEntity> irrigationEvents`, `CalculationInput input`
- **Output:** `void`
- **Summary:** Iterates through irrigation events and prepares inputs for metric calculations (appears to be incomplete implementation).

### getIrrigationMeasurementEntity
- **Input:** `List<CalculationSetting> settings`, `string settingName`, `double value`
- **Output:** `IrrigationMeasurementEntity`
- **Summary:** Creates an irrigation measurement entity by looking up the measurement variable ID from settings.

### CalculateIrrigationCalculationOutputP
- **Input:** `List<IrrigationEventEntity> inputs`, `CalculationInput input`
- **Output:** `void`
- **Summary:** Legacy method that calculates comprehensive irrigation metrics including interval, length, volumes, drain percentage, flow rate, and precipitation (older version).

### CalculateIrrigationCalculationOutput
- **Input:** `List<IrrigationEventEntity> events`, `CalculationInput input`
- **Output:** `void`
- **Summary:** Refactored method that calculates comprehensive irrigation metrics using helper methods for better code organization (current version).

### GetMeasurementValue
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `string settingName`
- **Output:** `double?`
- **Summary:** Retrieves the sum of measurement values for a specific measurement variable from an irrigation event.

### AddIrrigationIntervalMeasurement
- **Input:** `List<IrrigationEventEntity> events`, `CalculationInput input`
- **Output:** `void`
- **Summary:** Calculates and adds the time interval between current and previous irrigation event (requires at least 2 events).

### AddIrrigationLengthMeasurement
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`
- **Output:** `void`
- **Summary:** Calculates and adds the duration of an irrigation event (time between start and end).

### GetDensities
- **Input:** `CropProductionEntity cp`
- **Output:** `(double container, double plant)`
- **Summary:** Calculates container and plant densities per square meter based on row and spacing distances.

### AddIrrigationVolumes
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `double? irrigationVolume`, `(double container, double plant) density`
- **Output:** `void`
- **Summary:** Calculates and adds irrigation volume measurements per m2, per plant, and total volume for the production area.

### AddDrainVolumes
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `double? drainVolume`, `(double container, double plant) density`, `double? irrigationVolM2`
- **Output:** `void`
- **Summary:** Calculates and adds drain volume measurements per m2, per plant, and drain percentage relative to irrigation volume.

### AddIrrigationFlow
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `double? volume`
- **Output:** `void`
- **Summary:** Calculates and adds irrigation flow rate (volume per hour) for the event.

### AddIrrigationPrecipitation
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `double? irrigationVolM2`, `(double container, double plant) density`
- **Output:** `void`
- **Summary:** Calculates and adds irrigation precipitation rate (volume per m2 per hour).

### AddMeasurement
- **Input:** `IrrigationEventEntity evt`, `CalculationInput input`, `string measurementSettingName`, `double? value`
- **Output:** `void`
- **Summary:** Helper method to add a measurement to an irrigation event if value is not null.

---

## IAgriSmartApiClient.cs (Interface)

### GetIrrigationMeasurements
- **Input:** `string encodedStartingDateTime`, `string encodedEndingDateTime`, `int cropProductionId`, `string token`
- **Output:** `Task<IList<IrrigationMeasurement>>`
- **Summary:** Retrieves all irrigation measurements for a crop production within a date range.

### GetIrrigationEvents
- **Input:** `string encodedStartingDateTime`, `string encodedEndingDateTime`, `int cropProductionId`, `string token`
- **Output:** `Task<IList<IrrigationEvent>>`
- **Summary:** Retrieves all irrigation events for a crop production within a date range.

### CreateIrrigationEvent
- **Input:** `IrrigationEvent irrigationEvent`, `string token`
- **Output:** `Task<Response<CreateIrrigationEventResponse>>`
- **Summary:** Creates a new irrigation event in the system via API.

### GetIrrigationPlan
- **Input:** `int? irrigationPlanId`, `string token`
- **Output:** `Task<IrrigationPlan>`
- **Summary:** Retrieves an irrigation plan by ID from the API.

### GetIrrigationPlanEntries
- **Input:** `int? irrigationPlanId`, `string token`
- **Output:** `Task<IList<IrrigationPlanEntry>>`
- **Summary:** Retrieves all entries (schedule items) for a specific irrigation plan.

### CreateCropProductionIrrigationRequest
- **Input:** `CropProductionIrrigationRequest cropProductionIrrigationRequest`, `string token`
- **Output:** `Task<Response<CreateCropProductionIrrigationRequestResponse>>`
- **Summary:** Creates a new irrigation request for a crop production (triggers actual irrigation).

### GetAllCropProductionIrrigationRequests
- **Input:** `int cropProductionId`, `string token`, `bool onlyActive = false`
- **Output:** `Task<IList<CropProductionIrrigationRequest>>`
- **Summary:** Retrieves all irrigation requests for a crop production, optionally filtered to only active requests.

---

## GlobalOutput.cs

### getIrrigationIntervalStats
- **Input:** `bool excludeFirst`
- **Output:** `TimeSpanMetricStat`
- **Summary:** Calculates statistical metrics (min, max, average, sum) for irrigation intervals, optionally excluding the first event.

### getIrrigationLengthStats
- **Input:** None (uses class property)
- **Output:** `TimeSpanMetricStat`
- **Summary:** Calculates statistical metrics (min, max, average, sum) for irrigation event durations.

### getIrrigationVolumenSum
- **Input:** None (uses class property)
- **Output:** `Volume`
- **Summary:** Calculates the total sum of irrigation volumes across all metrics.

### getIrrigationVolumenMin
- **Input:** None (uses class property)
- **Output:** `Volume`
- **Summary:** Returns the minimum irrigation volume from all irrigation metrics.

### getIrrigationVolumenMax
- **Input:** None (uses class property)
- **Output:** `Volume`
- **Summary:** Returns the maximum irrigation volume from all irrigation metrics.

### getIrrigationVolumenAvg
- **Input:** None (uses class property)
- **Output:** `Volume`
- **Summary:** Calculates the average irrigation volume across all irrigation metrics.

# Irrigation and OnDemandIrrigation Related Functions

## IrrigationController.cs (Logic\IrrigationController.cs)

### Constructor: IrrigationController
- **Input**: `List<IrrigationRequest> irrigationRequests`
- **Output**: `IrrigationController` instance
- **Summary**: Initializes the irrigation controller with a list of irrigation requests to be processed.

### StartIrrigation
- **Input**: None
- **Output**: `void`
- **Summary**: Starts the irrigation process by iterating through all irrigation requests and activating pump and valve relays for each sector until all requests are completed.

### StopIrrigation
- **Input**: None
- **Output**: `void`
- **Summary**: Stops the irrigation process by checking and activating relays for all irrigation requests to turn them off.

### notAllRequestDone (private)
- **Input**: None
- **Output**: `bool`
- **Summary**: Checks if there are any undone irrigation requests in the list. Returns false if undone requests exist, true otherwise.

### SendSetOnSignal (private)
- **Input**: `Relay relay`
- **Output**: `void`
- **Summary**: Sends an activation signal to a specified relay (currently empty implementation).

---

## IrrigationMonitor.cs (Logic\IrrigationMonitor.cs)

### ToIrrigate
- **Input**: `CropProductionEntity cropProduction`
- **Output**: `IrrigationMonitorResponse`
- **Summary**: Calculates whether irrigation is needed based on volumetric humidity measurements, container capacity, depletion percentage, and drain thresholds. Returns an irrigation decision with calculated irrigation time in minutes.

### ToStopIrregate
- **Input**: None
- **Output**: `bool`
- **Summary**: Determines whether irrigation should be stopped (currently returns true by default).

### IsRelayActive
- **Input**: `Relay rely`
- **Output**: `bool`
- **Summary**: Checks if a relay is currently active (currently returns false by default).

---

## IrrigationRequest.cs (Logic\IrrigationRequest.cs)

### Constructor: IrrigationRequest
- **Input**: `CropProductionIrrigationSectorEntity irrigationSector`, `int irrigationTime`
- **Output**: `IrrigationRequest` instance
- **Summary**: Creates an irrigation request for a specific sector with a calculated irrigation time in minutes.

---

## OnDemandIrrigation.cs (Logic\OnDemandIrrigation.cs)

### Constructor: OnDemandIrrigation
- **Input**: `AgrismartApiConfiguration agrismartApiConfiguration`, `ILogger logger`, `string token`
- **Output**: `OnDemandIrrigation` instance
- **Summary**: Initializes the on-demand irrigation system with API configuration, logger, and authentication token.

### Run
- **Input**: `List<CropProduction> cropProductions`
- **Output**: `void`
- **Summary**: Main execution method that processes a list of crop productions, evaluates irrigation needs using IrrigationMonitor, creates irrigation requests for sectors that need watering, and starts the irrigation controller.

---

## OnDemandIrrigationProcess.cs (Logic\OnDemandIrrigationProcess.cs)

### Constructor: OnDemandIrrigationProcess
- **Input**: `ILogger logger`, `AgrismartApiConfiguration agrismartApiConfiguration`
- **Output**: `OnDemandIrrigationProcess` instance
- **Summary**: Initializes the on-demand irrigation process with logger and API configuration for managing the complete irrigation workflow.

### CreateApiSession
- **Input**: None (uses hardcoded credentials "agronomicProcess", "123")
- **Output**: `LoginResponse`
- **Summary**: Creates an API session by authenticating with the AgriSmart API and returns the login response containing the authentication token.

### CalculationCalculate
- **Input**: `string token`
- **Output**: `void`
- **Summary**: Orchestrates the complete irrigation calculation process by fetching companies, farms, production units, and crop productions from the API, then evaluating irrigation needs for each crop production using IrrigationMonitor.

---

## AgriSmartApiClient.cs (Services\AgriSmartApiClient.cs)

### GetCropProductionIrrigationSector
- **Input**: `int cropProduductionIrrigationSectorId`
- **Output**: `Task<CropProductionIrrigationSector>`
- **Summary**: Asynchronously retrieves irrigation sector data for a specific crop production from the AgriSmart API, including pump and valve relay information.

### GetCropProductions
- **Input**: `int productionUnitId`
- **Output**: `Task<IList<CropProduction>>`
- **Summary**: Asynchronously fetches all crop productions for a given production unit, which may contain irrigation-related data including irrigation sectors.

---

## IrrigationMonitorResponse.cs (Logic\IrrigationMonitor.cs)

### Properties
- **Irrigate**: `bool` - Indicates whether irrigation is needed
- **IrrigationTime**: `int` - Calculated irrigation time in minutes
- **Summary**: Response object containing the irrigation decision and timing information returned by IrrigationMonitor.ToIrrigate().

---

## Summary Statistics
- **Total Irrigation-Related Classes**: 6
- **Total Public Methods**: 11
- **Total Constructors**: 4
- **Key Workflow**: CreateApiSession → CalculationCalculate → IrrigationMonitor.ToIrrigate → OnDemandIrrigation.Run → IrrigationController.StartIrrigation

# Irrigation-Related Functions

## Command Handlers (Create, Update, Delete Operations)

### 1. CreateIrrigationPlanHandler.Handle
**Location:** `Handlers\Commands\CreateIrrigationPlanHandler.cs:21`

**Input:**
- `CreateIrrigationPlanCommand command` - Contains:
  - `int CatalogId`
  - `string Name`
  - `int DaysMask`
  - `double Tolerance`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateIrrigationPlanResponse>>`

**Summary:**
Creates a new irrigation plan by validating the command, mapping it to an IrrigationPlan entity, setting the creator and active status, and persisting it to the database.

---

### 2. UpdateIrrigationPlanHandler.Handle
**Location:** `Handlers\Commands\UpdateIrrigationPlanHandler.cs:24`

**Input:**
- `UpdateIrrigationPlanCommand command` - Contains:
  - `int Id`
  - `string Name`
  - `bool Active`
  - `double Tolerance`
  - `int DaysMask`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<UpdateIrrigationPlanResponse>>`

**Summary:**
Updates an existing irrigation plan by retrieving it by ID, modifying its properties (Name, Active, Tolerance, DaysMask), setting the updater, and saving the changes to the database.

---

### 3. CreateIrrigationPlanEntryHandler.Handle
**Location:** `Handlers\Commands\CreateIrrigationPlanEntryHandler.cs:21`

**Input:**
- `CreateIrrigationPlanEntryCommand command` - Contains irrigation plan entry details
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateIrrigationPlanEntryResponse>>`

**Summary:**
Creates a new irrigation plan entry by validating the command, mapping it to an IrrigationPlanEntry entity, setting the creator and active status, and persisting it to the database.

---

### 4. UpdateIrrigationPlanEntryHandler.Handle
**Location:** `Handlers\Commands\UpdateIrrigationPlanEntryHandler.cs:24`

**Input:**
- `UpdateIrrigationPlanEntryCommand command` - Contains:
  - `int Id`
  - `DateTime StartTime`
  - `int Duration`
  - `DateTime WindowStart`
  - `DateTime WindowEnd`
  - `int RepeatInterval`
  - `bool Active`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<UpdateIrrigationPlanEntryResponse>>`

**Summary:**
Updates an existing irrigation plan entry by retrieving it by ID, modifying its timing and scheduling properties (StartTime, Duration, WindowStart, WindowEnd, RepeatInterval, Active), and saving the changes.

---

### 5. CreateIrrigationEventHandler.Handle
**Location:** `Handlers\Commands\CreateIrrigationEventHandler.cs:21`

**Input:**
- `CreateIrrigationEventCommand command` - Contains:
  - `long Id`
  - `DateTime RecordDateTime`
  - `int CropProductionId`
  - `DateTime DateTimeStart`
  - `DateTime DateTimeEnd`
  - `List<IrrigationMeasurement> IrrigationEventMeasurements`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateIrrigationEventResponse>>`

**Summary:**
Creates a new irrigation event with associated measurements. Validates the command, maps it to an IrrigationEvent entity, processes and adds each irrigation measurement from the command, then persists the event to the database.

---

### 6. CreateCropProductionIrrigationSectorHandler.Handle
**Location:** `Handlers\Commands\CreateCropProductionIrrigationSectorHandler.cs:21`

**Input:**
- `CreateCropProductionIrrigationSectorCommand command` - Contains irrigation sector details
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateCropProductionIrrigationSectorResponse>>`

**Summary:**
Creates a new crop production irrigation sector by validating the command, mapping it to a CropProductionIrrigationSector entity, setting the creator and active status, and persisting it to the database.

---

### 7. UpdateCropProductionIrrigationSectorHandler.Handle
**Location:** `Handlers\Commands\UpdateCropProductionIrrigationSectorHandler.cs:24`

**Input:**
- `UpdateCropProductionIrrigationSectorCommand command` - Contains:
  - `int Id`
  - `int CropProductionId`
  - `string Name`
  - `bool Active`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<UpdateCropProductionIrrigationSectorResponse>>`

**Summary:**
Updates an existing crop production irrigation sector by retrieving it by ID, modifying its properties (CropProductionId, Name, Active), setting the updater, and saving the changes.

---

### 8. CreateCropProductionIrrigationRequestHandler.Handle
**Location:** `Handlers\Commands\CreateCropProductionIrrigationRequestHandler.cs:21`

**Input:**
- `CreateCropProductionIrrigationRequestCommand command` - Contains irrigation request details
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateCropProductionIrrigationRequestResponse>>`

**Summary:**
Creates a new crop production irrigation request by validating the command, mapping it to a CropProductionIrrigationRequest entity, setting the creator and active status, and persisting it to the database.

---

### 9. UpdateCropProductionIrrigationRequestHandler.Handle
**Location:** `Handlers\Commands\UpdateCropProductionIrrigationRequestHandler.cs:24`

**Input:**
- `UpdateCropProductionIrrigationRequestCommand command` - Contains:
  - `int Id`
  - `bool Active`
  - `DateTime DateStarted`
  - `DateTime DateEnded`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<UpdateCropProductionIrrigationRequestResponse>>`

**Summary:**
Updates an existing crop production irrigation request by retrieving it by ID, modifying its properties (Active, DateStarted, DateEnded), setting the updater, and saving the changes.

---

### 10. CreateRelayModuleCropProductionIrrigationSectorHandler.Handle
**Location:** `Handlers\Commands\CreateRelayModuleCropProductionIrrigationSectorHandler.cs:21`

**Input:**
- `CreateRelayModuleCropProductionIrrigationSectorCommand command` - Contains relay module irrigation sector details
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<CreateRelayModuleCropProductionIrrigationSectorResponse>>`

**Summary:**
Creates a new relay module crop production irrigation sector by validating the command, getting session user and profile IDs, mapping to a RelayModuleCropProductionIrrigationSector entity, setting the creator and active status, and persisting it to the database.

---

### 11. DeleteRelayModuleCropProductionIrrigationSectorHandler.Handle
**Location:** `Handlers\Commands\DeleteRelayModuleCropProductionIrrigationSectorHandler.cs:21`

**Input:**
- `DeleteRelayModuleCropProductionIrrigationSectorCommand command` - Contains identifier for deletion
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>>`

**Summary:**
Deletes a relay module crop production irrigation sector by validating the command, mapping it to the entity, and calling the repository's delete method.

---

## Query Handlers (Read Operations)

### 12. GetAllIrrigationPlansHandler.Handle
**Location:** `Handlers\Queries\GetAllIrrigationPlansHandler.cs:19`

**Input:**
- `GetAllIrrigationPlansQuery query` - Contains:
  - `int CatalogId`
  - `bool IncludeInactives`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllIrrigationPlansResponse>>`

**Summary:**
Retrieves all irrigation plans for a given catalog, optionally including inactive plans based on the IncludeInactives flag. Returns a response containing a collection of irrigation plans.

---

### 13. GetIrrigationPlanByIdHandler.Handle
**Location:** `Handlers\Queries\GetIrrigationPlanByIdHandler.cs:19`

**Input:**
- `GetIrrigationPlanByIdQuery query` - Contains:
  - `int Id`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetIrrigationPlanByIdResponse>>`

**Summary:**
Retrieves a specific irrigation plan by its unique identifier. Returns a response containing the irrigation plan details.

---

### 14. GetAllIrrigationPlanEntriesHandler.Handle
**Location:** `Handlers\Queries\GetAllIrrigationPlanEntriesHandler.cs:19`

**Input:**
- `GetAllIrrigationPlanEntriesQuery query` - Contains:
  - `int PlanId`
  - `bool IncludeInactives`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllIrrigationPlanEntriesResponse>>`

**Summary:**
Retrieves all irrigation plan entries for a specific plan, optionally including inactive entries. Returns a response containing a collection of irrigation plan entries.

---

### 15. GetIrrigationPlanEntryByIdHandler.Handle
**Location:** `Handlers\Queries\GetIrrigationPlanEntryByIdHandler.cs:19`

**Input:**
- `GetIrrigationPlanEntryByIdQuery query` - Contains:
  - `int Id`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetIrrigationPlanEntryByIdResponse>>`

**Summary:**
Retrieves a specific irrigation plan entry by its unique identifier. Returns a response containing the irrigation plan entry details.

---

### 16. GetAllIrrigationEventsHandler.Handle
**Location:** `Handlers\Queries\GetAllIrrigationEventsHandler.cs:19`

**Input:**
- `GetAllIrrigationEventsQuery query` - Contains:
  - `int CropProductionId`
  - `DateTime StartingDateTime`
  - `DateTime EndingDateTime`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllIrrigationEventsResponse>>`

**Summary:**
Retrieves all irrigation events for a specific crop production within a date range. Returns a response containing a collection of irrigation events between the specified start and end dates.

---

### 17. GetAllIrrigationMeasurementsHandler.Handle
**Location:** `Handlers\Queries\GetAllIrrigationMeasurementsHandler.cs:19`

**Input:**
- `GetAllIrrigationMeasurementsQuery query` - Contains:
  - `int CropProductionId`
  - `DateTime StartingDateTime`
  - `DateTime EndingDateTime`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllIrrigationMeasurementResponse>>`

**Summary:**
Retrieves all irrigation measurements for a specific crop production within a date range. Returns a response containing a collection of irrigation measurements between the specified start and end dates.

---

### 18. GetAllCropProductionIrrigationSectorsHandler.Handle
**Location:** `Handlers\Queries\GetAllCropProductionIrrigationSectorsHandler.cs:19`

**Input:**
- `GetAllCropProductionIrrigationSectorsQuery query` - Contains:
  - `int CompanyId`
  - `int FarmId`
  - `int ProductionUnitId`
  - `int CropProductionId`
  - `bool IncludeInactives`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllCropProductionIrrigationSectorsResponse>>`

**Summary:**
Retrieves all crop production irrigation sectors filtered by company, farm, production unit, and crop production, optionally including inactive sectors. Returns a response containing a collection of irrigation sectors.

---

### 19. GetAllCropProductionIrrigationRequestsHandler.Handle
**Location:** `Handlers\Queries\GetAllCropProductionIrrigationRequestsHandler.cs:19`

**Input:**
- `GetAllCropProductionIrrigationRequestsQuery query` - Contains:
  - `int ClientId`
  - `int CompanyId`
  - `int FarmId`
  - `int ProductionUnitId`
  - `int CropProductionId`
  - `bool IncludeInactives`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllCropProductionIrrigationRequestsResponse>>`

**Summary:**
Retrieves all crop production irrigation requests filtered by client, company, farm, production unit, and crop production, optionally including inactive requests. Returns a response containing a collection of irrigation requests.

---

### 20. GetCropProductionIrrigationRequestByIdHandler.Handle
**Location:** `Handlers\Queries\GetCropProductionIrrigationRequestByIdHandler.cs:20`

**Input:**
- `GetCropProductionIrrigationRequestByIdQuery query` - Contains:
  - `int Id`
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetCropProductionIrrigationRequestByIdResponse>>`

**Summary:**
Retrieves a specific crop production irrigation request by its unique identifier. Returns a response containing the irrigation request details including ID, CropProductionId, DateStarted, DateEnded, Active status, and audit fields.

---

### 21. GetAllRelayModuleCropProductionIrrigationSectorsHandler.Handle
**Location:** `Handlers\Queries\GetAllRelayModuleCropProductionIrrigationSectorsHandler.cs:19`

**Input:**
- `GetAllRelayModuleCropProductionIrrigationSectorsQuery query` - Contains query parameters
- `CancellationToken cancellationToken`

**Output:**
- `Task<Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>>`

**Summary:**
Retrieves all relay module crop production irrigation sectors. Note: The implementation appears to be incomplete and currently only returns a null object exception.

---

## Summary Statistics

- **Total Functions:** 21
- **Command Handlers (Create/Update/Delete):** 11
  - Create: 6
  - Update: 4
  - Delete: 1
- **Query Handlers (Read):** 10
  - GetAll: 6
  - GetById: 4

## Main Entities

1. **IrrigationPlan** - Defines irrigation scheduling plans with tolerance and day masks
2. **IrrigationPlanEntry** - Individual entries/schedules within an irrigation plan
3. **IrrigationEvent** - Records of actual irrigation events with measurements
4. **IrrigationMeasurement** - Measurement data associated with irrigation events
5. **CropProductionIrrigationSector** - Irrigation sectors associated with crop productions
6. **CropProductionIrrigationRequest** - Requests for irrigation on crop productions
7. **RelayModuleCropProductionIrrigationSector** - Links relay modules to irrigation sectors
 

 # Irrigation-Related Functions

This document lists all functions related to "Irrigation" found in the AgriSmart.Calculator codebase.

**Note:** No "OnDemandIrrigation" related functions were found in the codebase.

---

## 1. GetIrrigationMetrics
**File:** `Logic\CalculationsIrrigation.cs:9`

**Input:**
- `CalculationInput dataModel` - Contains irrigation data, crop production info, and measurement variables
- `DateTime date` - The specific date to get irrigation metrics for

**Output:**
- `List<IrrigationMetric>` - List of irrigation metrics for all irrigation events on the specified date, or null if no irrigation data exists

**Summary:**
Retrieves and calculates irrigation metrics for all irrigation events that occurred on a specific date. Filters irrigation events within the date range (00:00:00 to 23:59:59), orders them chronologically, and calculates metrics for each event using the current and previous irrigation event data.

---

## 2. CalculateIrrigationCalculationOutput
**File:** `Logic\CalculationsIrrigation.cs:39`

**Input:**
- `List<IrrigationEventEntity> inputs` - List containing current irrigation event (index 0) and optionally previous event (index 1)
- `CropProductionEntity cropProduction` - Crop production details including area, distances, and container information
- `List<MeasurementVariable> measurementVariables` - List of measurement variable definitions

**Output:**
- `IrrigationMetric` - Calculated irrigation metrics including volumes, intervals, flow rates, and drainage percentages

**Summary:**
Calculates comprehensive irrigation metrics from irrigation event data. Computes irrigation interval (time since last irrigation), irrigation length, volumes per m², per plant, and total, drainage volumes and percentages, irrigation flow rate, and precipitation rate. Uses container and plant density calculations based on row and plant spacing.

---

## 3. GetIrrigationEvents
**File:** `Services\AgriSmartApiClient.cs:446`

**Input:**
- `string encodedStartingDateTime` - URL-encoded starting date/time for the query period
- `string encodedEndingDateTime` - URL-encoded ending date/time for the query period
- `int cropProductionId` - ID of the crop production to query

**Output:**
- `Task<IList<IrrigationEvent>>` - Async task returning list of irrigation events, or null if request fails

**Summary:**
API client method that retrieves irrigation events from the AgriSmart API for a specific crop production within a specified date range. Makes HTTP GET request to the irrigation events endpoint with authentication.

---

## 4. GetIrrigationMeasurements
**File:** `Services\AgriSmartApiClient.cs:479`

**Input:**
- `string encodedStartingDateTime` - URL-encoded starting date/time for the query period
- `string encodedEndingDateTime` - URL-encoded ending date/time for the query period
- `int cropProductionId` - ID of the crop production to query

**Output:**
- `Task<IList<IrrigationMeasurement>>` - Async task returning list of irrigation measurements, or null if request fails

**Summary:**
API client method that retrieves irrigation measurement data from the AgriSmart API for a specific crop production within a specified date range. Measurements include values like irrigation volume and drain volume associated with irrigation events.

---

## 5. GetCropProductionIrrigationSector
**File:** `Services\AgriSmartApiClient.cs:671`

**Input:**
- `int cropProduductionIrrigationSectorId` - ID of the crop production irrigation sector to retrieve

**Output:**
- `Task<CropProductionIrrigationSector>` - Async task returning the irrigation sector details, or null if request fails

**Summary:**
API client method that retrieves a specific crop production irrigation sector from the AgriSmart API. An irrigation sector represents a subdivision of the crop production area with its own irrigation configuration.

---

## 6. AddIrrigationMeasurement
**File:** `Entities\IrrigationEventEntity.cs:20`

**Input:**
- `IrrigationMeasurementEntity irrigationMeasurementEntity` - The irrigation measurement entity to add to this event

**Output:**
- `void` - No return value (modifies the entity's IrrigationMeasurements list)

**Summary:**
Instance method that adds an irrigation measurement to an irrigation event. Initializes the IrrigationMeasurements list if it doesn't exist, then appends the new measurement. Used to build up the collection of measurements associated with a specific irrigation event.

---

## Related Usage in Other Functions

### Calculations.Calculate
**File:** `Logic\Calculations.cs:8`

**Irrigation-Related Operations:**
- Calls `CalculationsIrrigation.GetIrrigationMetrics()` to retrieve irrigation metrics for each date
- Uses irrigation metrics to calculate crop evapotranspiration by combining:
  - Irrigation volume (sum of all irrigation events)
  - Drain volume (sum of all drainage)
  - Changes in volumetric water content
  - Container medium volume

**Formula:** `CropEvapoTranspiration = irrigationVolume - drainVolume - containerMediumVolumen * (deltaVolumetricWaterContent / 100)`

---

### CalculationsProcess.CalculationCalculate
**File:** `Logic\CalculationsProcess.cs:34`

**Irrigation-Related Operations:**
- Retrieves irrigation events using `GetIrrigationEvents()` API call
- Retrieves irrigation measurements using `GetIrrigationMeasurements()` API call
- Creates `IrrigationEventEntity` objects and associates measurements with events
- Builds irrigation data collection for use in the calculation pipeline
- Passes irrigation data to the main `Calculations.Calculate()` method

---

## Summary Statistics

- **Total Irrigation-Related Functions:** 6 main functions
- **API Client Methods:** 3 (GetIrrigationEvents, GetIrrigationMeasurements, GetCropProductionIrrigationSector)
- **Calculation Methods:** 2 (GetIrrigationMetrics, CalculateIrrigationCalculationOutput)
- **Entity Helper Methods:** 1 (AddIrrigationMeasurement)
- **OnDemandIrrigation Functions:** 0 (none found)

# Irrigation-Related Functions

## Query Repository Functions

### IIrrigationPlanQueryRepository

#### GetAllAsync
- **Input:**
  - `int catalogId` - The catalog ID to filter irrigation plans
  - `bool includeInactives = false` (optional) - Whether to include inactive plans
- **Output:** `Task<IReadOnlyList<IrrigationPlan>>` - List of irrigation plans
- **Summary:** Retrieves all irrigation plans for a specific catalog, optionally including inactive plans

#### GetByIdAsync
- **Input:** `int id` - The irrigation plan ID
- **Output:** `Task<IrrigationPlan?>` - Single irrigation plan or null if not found
- **Summary:** Retrieves a specific irrigation plan by its unique identifier

---

### IIrrigationPlanEntryQueryRepository

#### GetAllAsync
- **Input:**
  - `int planId` - The plan ID to filter entries
  - `bool includeInactives = false` (optional) - Whether to include inactive entries
- **Output:** `Task<IReadOnlyList<IrrigationPlanEntry>>` - List of irrigation plan entries
- **Summary:** Retrieves all entries for a specific irrigation plan, optionally including inactive entries

#### GetByIdAsync
- **Input:** `int id` - The irrigation plan entry ID
- **Output:** `Task<IrrigationPlanEntry?>` - Single irrigation plan entry or null if not found
- **Summary:** Retrieves a specific irrigation plan entry by its unique identifier

---

### IIrrigationMeasurementQueryRepository

#### GetAllAsync
- **Input:**
  - `int CropProductionId` - The crop production ID
  - `DateTime StartindDateTime` - Start date/time for filtering measurements
  - `DateTime EndingDateTime` - End date/time for filtering measurements
- **Output:** `Task<IReadOnlyList<IrrigationMeasurement>>` - List of irrigation measurements
- **Summary:** Retrieves all irrigation measurements for a specific crop production within a date/time range

---

### IIrrigationEventQueryRepository

#### GetAllAsync
- **Input:**
  - `int CropProductionId` - The crop production ID
  - `DateTime StartindDateTime` - Start date/time for filtering events
  - `DateTime EndingDateTime` - End date/time for filtering events
- **Output:** `Task<IReadOnlyList<IrrigationEvent>>` - List of irrigation events
- **Summary:** Retrieves all irrigation events for a specific crop production within a date/time range

---

### ICropProductionIrrigationSectorQueryRepository

#### GetAllAsync
- **Input:**
  - `int companyId = 0` (optional) - Company ID filter
  - `int farmId = 0` (optional) - Farm ID filter
  - `int productionUnitId = 0` (optional) - Production unit ID filter
  - `int cropProductionId = 0` (optional) - Crop production ID filter
  - `bool includeInactives = false` (optional) - Whether to include inactive sectors
- **Output:** `Task<IReadOnlyList<CropProductionIrrigationSector>>` - List of irrigation sectors
- **Summary:** Retrieves all irrigation sectors with flexible filtering by company, farm, production unit, or crop production

#### GetByIdAsync
- **Input:** `int id` - The irrigation sector ID
- **Output:** `Task<CropProductionIrrigationSector?>` - Single irrigation sector or null if not found
- **Summary:** Retrieves a specific crop production irrigation sector by its unique identifier

---

### ICropProductionIrrigationRequestQueryRepository

#### GetAllAsync
- **Input:**
  - `int clientId = 0` (optional) - Client ID filter
  - `int companyId = 0` (optional) - Company ID filter
  - `int FarmId = 0` (optional) - Farm ID filter
  - `int productionUnitId = 0` (optional) - Production unit ID filter
  - `int cropProductionId = 0` (optional) - Crop production ID filter
  - `bool includeInactives = false` (optional) - Whether to include inactive requests
- **Output:** `Task<IReadOnlyList<CropProductionIrrigationRequestDto>>` - List of irrigation requests (DTO)
- **Summary:** Retrieves all irrigation requests with flexible filtering by client, company, farm, production unit, or crop production

#### GetByIdAsync
- **Input:** `int id` - The irrigation request ID
- **Output:** `Task<CropProductionIrrigationRequest>` - Single irrigation request entity
- **Summary:** Retrieves a specific crop production irrigation request by its unique identifier

---

## Command Repository Functions

### IIrrigationEventCommandRepository

#### CreateAsync
- **Input:** `IrrigationEvent irrigationEvent` - The irrigation event object to create
- **Output:** `Task<IrrigationEvent>` - The created irrigation event with generated ID
- **Summary:** Creates a new irrigation event record in the database

---

### ICropProductionIrrigationRequestCommandRepository

#### CreateAsync
- **Input:** `CropProductionIrrigationRequest irrigationRequest` - The irrigation request object to create
- **Output:** `Task<CropProductionIrrigationRequest>` - The created irrigation request with generated ID
- **Summary:** Creates a new irrigation request for a crop production

---

## Inherited Command Repository Functions

The following repositories inherit from `IBaseCommandRepository<T>` and have access to standard CRUD operations:

### IIrrigationPlanCommandRepository
- **Inherits:** `IBaseCommandRepository<IrrigationPlan>`
- **Summary:** Provides standard create, update, and delete operations for irrigation plans

### IIrrigationPlanEntryCommandRepository
- **Inherits:** `IBaseCommandRepository<IrrigationPlanEntry>`
- **Summary:** Provides standard create, update, and delete operations for irrigation plan entries

### ICropProductionIrrigationSectorCommandRepository
- **Inherits:** `IBaseCommandRepository<CropProductionIrrigationSector>`
- **Summary:** Provides standard create, update, and delete operations for irrigation sectors

### IRelayModuleCropProductionIrrigationSectorCommandRepository
- **Inherits:** `IBaseCommandRepository<RelayModuleCropProductionIrrigationSector>`
- **Summary:** Provides standard create, update, and delete operations for relay module-irrigation sector mappings

---

## Notes

- **OnDemandIrrigation:** No specific "OnDemandIrrigation" functions were found in the codebase. Irrigation requests appear to be handled through `CropProductionIrrigationRequest` entities.
- **Total Functions Found:** 14 explicit function declarations across 7 query repositories and 2 command repositories
- **Additional Inherited Functions:** 4 repositories inherit base CRUD operations from `IBaseCommandRepository<T>`

# Irrigation and OnDemandIrrigation Related Functions

## IrrigationController.cs

### IrrigationController (Constructor)
- **Input**: `List<IrrigationRequest> irrigationRequests`
- **Output**: Instance of IrrigationController
- **Summary**: Initializes the irrigation controller with a list of irrigation requests to be processed.

### StartIrrigation
- **Input**: None
- **Output**: `void`
- **Summary**: Starts the irrigation process by iterating through all irrigation requests. For each request, activates the pump relay and valve relay if the pump is not already active. Continues until all requests are marked as done.

### StopIrrigation
- **Input**: None
- **Output**: `void`
- **Summary**: Stops the irrigation process by iterating through all irrigation requests and sending on signals to pump and valve relays.

### notAllRequestDone (Private)
- **Input**: None
- **Output**: `bool`
- **Summary**: Checks if there are any undone irrigation requests remaining in the queue. Returns false if undone requests exist, true otherwise.

### SendSetOnSignal (Private)
- **Input**: `Relay relay`
- **Output**: `void`
- **Summary**: Placeholder method intended to send a signal to activate a relay (implementation pending).

---

## IrrigationMonitor.cs

### ToIrrigate
- **Input**: `CropProductionEntity cropProduction`
- **Output**: `IrrigationMonitorResponse`
- **Summary**: Analyzes crop production data to determine if irrigation is needed. Calculates volumetric humidity setpoint, drain percentages, and total irrigation volume required. Returns a response indicating whether to irrigate and the calculated irrigation time in minutes.

### ToStopIrregate
- **Input**: None
- **Output**: `bool`
- **Summary**: Determines whether to stop irrigation (currently returns true as a placeholder).

### IsRelayActive
- **Input**: `Relay relay`
- **Output**: `bool`
- **Summary**: Checks if a given relay is currently active (currently returns false as a placeholder).

---

## IrrigationRequest.cs

### IrrigationRequest (Constructor)
- **Input**: `CropProductionIrrigationSectorEntity irrigationSector`, `int irrigationTime`
- **Output**: Instance of IrrigationRequest
- **Summary**: Creates an irrigation request with the specified irrigation sector and duration in minutes.

---

## OnDemandIrrigation.cs

### OnDemandIrrigation (Constructor)
- **Input**: `AgrismartApiConfiguration agrismartApiConfiguration`, `ILogger logger`, `string token`
- **Output**: Instance of OnDemandIrrigation
- **Summary**: Initializes the on-demand irrigation service with API configuration, logger, and authentication token.

### Run
- **Input**: `List<CropProduction> cropProductions`
- **Output**: `void`
- **Summary**: Processes a list of crop productions to determine irrigation needs. For each crop production, checks if irrigation is required using IrrigationMonitor. Creates irrigation requests for each irrigation sector that needs watering, then starts the irrigation controller.

---

## OnDemandIrrigationProcess.cs

### OnDemandIrrigationProcess (Constructor)
- **Input**: `ILogger logger`, `AgrismartApiConfiguration agrismartApiConfiguration`
- **Output**: Instance of OnDemandIrrigationProcess
- **Summary**: Initializes the on-demand irrigation process with logger and API configuration.

### CreateApiSession
- **Input**: None
- **Output**: `LoginResponse`
- **Summary**: Creates an API session by logging in with hardcoded credentials ("agronomicProcess", "123"). Returns the login response containing authentication token and role information.

### CalculationCalculate
- **Input**: `string token`
- **Output**: `void`
- **Summary**: Main calculation workflow that retrieves hierarchical farm data (companies > farms > production units > crop productions) from the API. For each crop production, creates an entity and checks irrigation requirements using IrrigationMonitor.

---

## AgriSmartApiClient.cs

### GetCropProductionIrrigationSector
- **Input**: `int cropProduductionIrrigationSectorId`
- **Output**: `Task<CropProductionIrrigationSector>`
- **Summary**: Async method that retrieves crop production irrigation sector details from the API by ID. Returns the irrigation sector object containing information about pump relay, valve relay, and polygon coordinates.

---

## IrrigationMonitorResponse (Response Class)

### Properties
- **Irrigate**: `bool` - Indicates whether irrigation is needed (default: false)
- **IrrigationTime**: `int` - Calculated irrigation duration in minutes (default: 0)
- **Summary**: Data transfer object used to communicate irrigation decisions from the monitoring system.


