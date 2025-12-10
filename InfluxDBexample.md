using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

// Install NuGet package: InfluxDB.Client
// dotnet add package InfluxDB.Client

using InfluxDB.Client;
using InfluxDB.Client.Api.Domain;
using InfluxDB.Client.Core;

namespace InfluxDBClient
{
    // Model for your device data
    public class DeviceRawData
    {
        public DateTime Timestamp { get; set; }
        public string Device { get; set; }
        public string Sensor { get; set; }
        public string ClientId { get; set; }
        public string UserId { get; set; }
        public string Payload { get; set; }
        public bool Summarized { get; set; }
        public long Id { get; set; }
    }

    public class InfluxDBService : IDisposable
    {
        private readonly InfluxDBClient _client;
        private readonly string _bucket;
        private readonly string _org;

        public InfluxDBService(string url, string token, string org, string bucket)
        {
            _client = new InfluxDBClient(url, token);
            _bucket = bucket;
            _org = org;
        }

        /// <summary>
        /// Query device raw data between start and end datetime
        /// </summary>
        public async Task<List<DeviceRawData>> GetDeviceRawDataAsync(
            DateTime startDateTime, 
            DateTime endDateTime,
            string deviceId = null,
            string sensor = null)
        {
            var flux = BuildFluxQuery(startDateTime, endDateTime, deviceId, sensor);
            
            var queryApi = _client.GetQueryApi();
            var results = new List<DeviceRawData>();

            await queryApi.QueryAsync(flux, _org, (cancellable, record) =>
            {
                results.Add(new DeviceRawData
                {
                    Timestamp = record.GetTime().GetValueOrDefault().ToDateTimeUtc(),
                    Device = record.GetValueByKey("device")?.ToString(),
                    Sensor = record.GetValueByKey("sensor")?.ToString(),
                    ClientId = GetStringValue(record, "client_id"),
                    UserId = GetStringValue(record, "user_id"),
                    Payload = GetStringValue(record, "payload"),
                    Summarized = GetBoolValue(record, "summarized"),
                    Id = GetLongValue(record, "id")
                });
            });

            return results;
        }

        /// <summary>
        /// Build Flux query with filters
        /// </summary>
        private string BuildFluxQuery(
            DateTime startDateTime, 
            DateTime endDateTime,
            string deviceId = null,
            string sensor = null)
        {
            var start = startDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var stop = endDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");

            var query = new StringBuilder();
            query.AppendLine($"from(bucket: \"{_bucket}\")");
            query.AppendLine($"  |> range(start: {start}, stop: {stop})");
            query.AppendLine("  |> filter(fn: (r) => r._measurement == \"device_raw\")");

            // Optional filters
            if (!string.IsNullOrEmpty(deviceId))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.device == \"{deviceId}\")");
            }

            if (!string.IsNullOrEmpty(sensor))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.sensor == \"{sensor}\")");
            }

            query.AppendLine("  |> pivot(rowKey:[\"_time\"], columnKey: [\"_field\"], valueColumn: \"_value\")");
            query.AppendLine("  |> sort(columns: [\"_time\"])");

            return query.ToString();
        }

        // Helper methods to safely extract values
        private string GetStringValue(FluxRecord record, string key)
        {
            return record.GetValueByKey(key)?.ToString() ?? string.Empty;
        }

        private bool GetBoolValue(FluxRecord record, string key)
        {
            var value = record.GetValueByKey(key);
            if (value == null) return false;
            
            if (value is bool boolValue) return boolValue;
            if (bool.TryParse(value.ToString(), out var parsed)) return parsed;
            
            return value.ToString()?.ToLower() == "true";
        }

        private long GetLongValue(FluxRecord record, string key)
        {
            var value = record.GetValueByKey(key);
            if (value == null) return 0;
            
            if (long.TryParse(value.ToString(), out var parsed))
                return parsed;
            
            return 0;
        }

        public void Dispose()
        {
            _client?.Dispose();
        }
    }

    // Example API Controller
    public class DeviceDataController
    {
        private readonly InfluxDBService _influxService;

        public DeviceDataController()
        {
            // Configuration
            var url = "http://163.178.171.145:8086";
            var token = "i4E84myrFfyH-otPa2Ph5YkF-e5nJP4e39rV-AAdbjDrwG1Lu7NofaiVhQ3-DEf9XiwHZEkPhPHRY2p5MqRuZA==";
            var org = "AgriSmart";
            var bucket = "AgriSmartDevice";

            _influxService = new InfluxDBService(url, token, org, bucket);
        }

        /// <summary>
        /// GET /DeviceRawData?start_datetime={start}&end_datetime={end}
        /// </summary>
        public async Task<IActionResult> GetDeviceRawData(
            DateTime? start_datetime,
            DateTime? end_datetime,
            string device = null,
            string sensor = null)
        {
            try
            {
                // Default to last 24 hours if not specified
                var start = start_datetime ?? DateTime.UtcNow.AddDays(-1);
                var end = end_datetime ?? DateTime.UtcNow;

                var data = await _influxService.GetDeviceRawDataAsync(start, end, device, sensor);

                return new OkObjectResult(new
                {
                    success = true,
                    count = data.Count,
                    start_datetime = start,
                    end_datetime = end,
                    data = data
                });
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }

    // Placeholder for IActionResult (use actual ASP.NET Core types)
    public interface IActionResult { }
    public class OkObjectResult : IActionResult
    {
        public OkObjectResult(object value) { }
    }
    public class BadRequestObjectResult : IActionResult
    {
        public BadRequestObjectResult(object value) { }
    }

    // Example usage
    class Program
    {
        static async Task Main(string[] args)
        {
            var service = new InfluxDBService(
                url: "http://163.178.171.145:8086",
                token: "i4E84myrFfyH-otPa2Ph5YkF-e5nJP4e39rV-AAdbjDrwG1Lu7NofaiVhQ3-DEf9XiwHZEkPhPHRY2p5MqRuZA==",
                org: "AgriSmart",
                bucket: "AgriSmartDevice"
            );

            try
            {
                // Query last hour of data
                var startTime = DateTime.UtcNow.AddHours(-1);
                var endTime = DateTime.UtcNow;

                Console.WriteLine($"Querying data from {startTime:yyyy-MM-dd HH:mm:ss} to {endTime:yyyy-MM-dd HH:mm:ss}");

                var data = await service.GetDeviceRawDataAsync(startTime, endTime);

                Console.WriteLine($"Retrieved {data.Count} records");

                foreach (var record in data.Take(10))
                {
                    Console.WriteLine($"[{record.Timestamp:yyyy-MM-dd HH:mm:ss}] Device: {record.Device}, Sensor: {record.Sensor}, Payload: {record.Payload}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            finally
            {
                service.Dispose();
            }
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace YourApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceRawDataController : ControllerBase
    {
        private readonly InfluxDBService _influxService;

        public DeviceRawDataController(IConfiguration configuration)
        {
            // Read from appsettings.json
            var influxConfig = configuration.GetSection("InfluxDB");
            
            _influxService = new InfluxDBService(
                url: influxConfig["Url"],
                token: influxConfig["Token"],
                org: influxConfig["Organization"],
                bucket: influxConfig["Bucket"]
            );
        }

        /// <summary>
        /// Get device raw data within a time range
        /// GET /api/DeviceRawData?start_datetime=2024-12-01T00:00:00Z&end_datetime=2024-12-10T23:59:59Z
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<DeviceRawDataResponse>> GetDeviceRawData(
            [FromQuery] DateTime? start_datetime,
            [FromQuery] DateTime? end_datetime,
            [FromQuery] string device = null,
            [FromQuery] string sensor = null,
            [FromQuery] int limit = 1000)
        {
            try
            {
                // Validate datetime parameters
                if (start_datetime.HasValue && end_datetime.HasValue && start_datetime > end_datetime)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Error = "start_datetime must be before end_datetime"
                    });
                }

                // Default to last 24 hours if not specified
                var start = start_datetime ?? DateTime.UtcNow.AddDays(-1);
                var end = end_datetime ?? DateTime.UtcNow;

                // Limit time range to prevent huge queries (optional)
                var timeSpan = end - start;
                if (timeSpan.TotalDays > 30)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Error = "Time range cannot exceed 30 days"
                    });
                }

                var data = await _influxService.GetDeviceRawDataAsync(start, end, device, sensor);

                // Apply limit
                if (data.Count > limit)
                {
                    data = data.Take(limit).ToList();
                }

                return Ok(new DeviceRawDataResponse
                {
                    Success = true,
                    Count = data.Count,
                    StartDateTime = start,
                    EndDateTime = end,
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Error = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get latest device data
        /// GET /api/DeviceRawData/latest?device=device123&limit=10
        /// </summary>
        [HttpGet("latest")]
        public async Task<ActionResult<DeviceRawDataResponse>> GetLatestData(
            [FromQuery] string device = null,
            [FromQuery] string sensor = null,
            [FromQuery] int limit = 10)
        {
            try
            {
                // Query last hour by default for latest data
                var end = DateTime.UtcNow;
                var start = end.AddHours(-1);

                var data = await _influxService.GetDeviceRawDataAsync(start, end, device, sensor);

                // Get most recent records
                data = data.OrderByDescending(d => d.Timestamp).Take(limit).ToList();

                return Ok(new DeviceRawDataResponse
                {
                    Success = true,
                    Count = data.Count,
                    StartDateTime = start,
                    EndDateTime = end,
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Error = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get aggregated statistics
        /// GET /api/DeviceRawData/stats?start_datetime=...&end_datetime=...&device=...
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<StatsResponse>> GetStats(
            [FromQuery] DateTime? start_datetime,
            [FromQuery] DateTime? end_datetime,
            [FromQuery] string device = null,
            [FromQuery] string sensor = null)
        {
            try
            {
                var start = start_datetime ?? DateTime.UtcNow.AddDays(-1);
                var end = end_datetime ?? DateTime.UtcNow;

                var data = await _influxService.GetDeviceRawDataAsync(start, end, device, sensor);

                var stats = new StatsResponse
                {
                    Success = true,
                    TotalRecords = data.Count,
                    StartDateTime = start,
                    EndDateTime = end,
                    DeviceCount = data.Select(d => d.Device).Distinct().Count(),
                    SensorCount = data.Select(d => d.Sensor).Distinct().Count(),
                    Devices = data.GroupBy(d => d.Device)
                        .Select(g => new DeviceStats
                        {
                            Device = g.Key,
                            RecordCount = g.Count(),
                            FirstRecord = g.Min(x => x.Timestamp),
                            LastRecord = g.Max(x => x.Timestamp)
                        })
                        .ToList()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Error = $"Internal server error: {ex.Message}"
                });
            }
        }
    }

    // Response models
    public class DeviceRawDataResponse
    {
        public bool Success { get; set; }
        public int Count { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public List<DeviceRawData> Data { get; set; }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; }
        public string Error { get; set; }
    }

    public class StatsResponse
    {
        public bool Success { get; set; }
        public int TotalRecords { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int DeviceCount { get; set; }
        public int SensorCount { get; set; }
        public List<DeviceStats> Devices { get; set; }
    }

    public class DeviceStats
    {
        public string Device { get; set; }
        public int RecordCount { get; set; }
        public DateTime FirstRecord { get; set; }
        public DateTime LastRecord { get; set; }
    }
}


{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "InfluxDB": {
    "Url": "http://163.178.171.145:8086",
    "Token": "i4E84myrFfyH-otPa2Ph5YkF-e5nJP4e39rV-AAdbjDrwG1Lu7NofaiVhQ3-DEf9XiwHZEkPhPHRY2p5MqRuZA==",
    "Organization": "AgriSmart",
    "Bucket": "AgriSmartDevice"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:4200"
    ]
  }
}


using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AgriSmart Device Data API",
        Version = "v1",
        Description = "API for querying device raw data from InfluxDB"
    });
});

// Register InfluxDB service as singleton
builder.Services.AddSingleton<InfluxDBService>(sp =>
{
    var config = builder.Configuration.GetSection("InfluxDB");
    return new InfluxDBService(
        url: config["Url"],
        token: config["Token"],
        org: config["Organization"],
        bucket: config["Bucket"]
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AgriSmart API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();

Setup Instructions
1. Install NuGet Package
bashdotnet add package InfluxDB.Client
```

### 2. **Project Structure**
```
YourApi/
├── Controllers/
│   └── DeviceRawDataController.cs
├── Services/
│   └── InfluxDBService.cs (from first artifact)
├── Models/
│   └── DeviceRawData.cs
├── appsettings.json
└── Program.cs
3. Important: Configure Windows Firewall on InfluxDB Server
On the server with IP 163.178.171.145, open port 8086:
powershell# Run as Administrator on the InfluxDB server
New-NetFirewallRule -DisplayName "InfluxDB" -Direction Inbound -Protocol TCP -LocalPort 8086 -Action Allow
4. Test Connection from Your C# App
csharpusing System.Net.Http;

var client = new HttpClient();
var response = await client.GetAsync("http://163.178.171.145:8086/health");
Console.WriteLine($"InfluxDB Health: {response.StatusCode}");
```

## API Endpoints

### **1. Get Data by Time Range**
```
GET http://yourdomain.com/api/DeviceRawData?start_datetime=2024-12-09T00:00:00Z&end_datetime=2024-12-10T23:59:59Z
Optional parameters:

device: Filter by device ID
sensor: Filter by sensor type
limit: Max records to return (default 1000)

Example Response:
json{
  "success": true,
  "count": 150,
  "startDateTime": "2024-12-09T00:00:00Z",
  "endDateTime": "2024-12-10T23:59:59Z",
  "data": [
    {
      "timestamp": "2024-12-10T12:30:45Z",
      "device": "device123",
      "sensor": "temperature",
      "clientId": "client1",
      "userId": "user1",
      "payload": "{\"temp\":25.5}",
      "summarized": false,
      "id": 12345
    }
  ]
}
```

### **2. Get Latest Data**
```
GET http://yourdomain.com/api/DeviceRawData/latest?device=device123&limit=10
```

### **3. Get Statistics**
```
GET http://yourdomain.com/api/DeviceRawData/stats?start_datetime=2024-12-09T00:00:00Z&end_datetime=2024-12-10T23:59:59Z
Testing with cURL
bash# Get last 24 hours of data
curl "http://yourdomain.com/api/DeviceRawData"

# Get data for specific time range
curl "http://yourdomain.com/api/DeviceRawData?start_datetime=2024-12-09T00:00:00Z&end_datetime=2024-12-10T23:59:59Z"

# Get data for specific device
curl "http://yourdomain.com/api/DeviceRawData?device=device123&limit=100"

# Get latest 10 records
curl "http://yourdomain.com/api/DeviceRawData/latest?limit=10"
Security Considerations
⚠️ IMPORTANT: Your InfluxDB token is currently exposed. For production:

Use Environment Variables:

csharp// In appsettings.json, remove the token
// Set as environment variable on server:
// INFLUXDB_TOKEN=your_token_here

var token = Environment.GetEnvironmentVariable("INFLUXDB_TOKEN") 
    ?? configuration["InfluxDB:Token"];

Add Authentication to Your API:

csharpbuilder.Services.AddAuthentication("Bearer")
    .AddJwtBearer();

Use HTTPS:

csharpapp.UseHttpsRedirection();

Restrict CORS:

csharppolicy.WithOrigins("https://yourfrontend.com")
      .AllowAnyMethod()
      .AllowAnyHeader();
This solution gives you a complete REST API to query your InfluxDB from any C# backend!