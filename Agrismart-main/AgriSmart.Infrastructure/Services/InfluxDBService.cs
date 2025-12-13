using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using InfluxDB.Client;
using InfluxDB.Client.Api.Domain;
using InfluxDB.Client.Core;
using InfluxDB.Client.Core.Flux.Domain;
using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;

namespace AgriSmart.Infrastructure.Services
{
    public class InfluxDBService : IDisposable
    {
        private readonly InfluxDBClient _client;
        private readonly string _bucket;
        private readonly string _org;

        public InfluxDBService(string url, string token, string org, string bucket)
        {
            // Configure InfluxDB client with timeout settings
            var options = InfluxDBClientOptions.Builder.CreateNew()
                .Url(url)
                .AuthenticateToken(token)
                .TimeOut(TimeSpan.FromSeconds(30)) // 30 second timeout for queries
                .Build();

            _client = new InfluxDBClient(options);
            _bucket = bucket;
            _org = org;
        }

        /// <summary>
        /// Query device raw data between start and end datetime with filters
        /// </summary>
        public async Task<List<DeviceRawData>> GetDeviceRawDataAsync(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100000,
            CancellationToken cancellationToken = default)
        {
            var flux = BuildFluxQuery(startDateTime, endDateTime, deviceId, sensor, pageNumber, pageSize);

            var queryApi = _client.GetQueryApi();
            var results = new List<DeviceRawData>();

            var tables = await queryApi.QueryAsync(flux, _org, cancellationToken);

            foreach (var table in tables)
            {
                foreach (var record in table.Records)
                {
                    results.Add(new DeviceRawData
                    {
                        Id = GetIntValue(record, "id"),
                        RecordDate = record.GetTime()?.ToDateTimeUtc(),
                        DeviceId = GetStringValue(record, "device"),
                        Sensor = GetStringValue(record, "sensor"),
                        ClientId = GetStringValue(record, "client_id"),
                        UserId = GetStringValue(record, "user_id"),
                        Payload = GetStringValue(record, "payload")
                    });
                }
            }

            return results;
        }

        /// <summary>
        /// Get aggregated device raw data with specified interval and type
        /// </summary>
        public async Task<List<AggregatedDeviceData>> GetAggregatedDeviceRawDataAsync(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null,
            string aggregationInterval = "hour",
            string aggregationType = "avg",
            CancellationToken cancellationToken = default)
        {
            var flux = BuildAggregatedFluxQuery(startDateTime, endDateTime, deviceId, sensor, aggregationInterval, aggregationType);

            var queryApi = _client.GetQueryApi();
            var results = new List<AggregatedDeviceData>();

            var tables = await queryApi.QueryAsync(flux, _org, cancellationToken);

            foreach (var table in tables)
            {
                foreach (var record in table.Records)
                {
                    var timestamp = record.GetTime()?.ToDateTimeUtc() ?? DateTime.UtcNow;
                    var device = GetStringValue(record, "device");
                    var sensorName = GetStringValue(record, "sensor");

                    // Get the aggregated value based on aggregation type
                    var value = GetDecimalValue(record, "_value");

                    results.Add(new AggregatedDeviceData
                    {
                        Timestamp = timestamp,
                        DeviceId = device,
                        Sensor = sensorName,
                        Value = value,
                        MinValue = value,
                        MaxValue = value,
                        DataPointCount = 1
                    });
                }
            }

            return results;
        }

        /// <summary>
        /// Get count of records matching the filters
        /// </summary>
        public async Task<int> GetCountAsync(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null,
            CancellationToken cancellationToken = default)
        {
            var flux = BuildCountFluxQuery(startDateTime, endDateTime, deviceId, sensor);

            var queryApi = _client.GetQueryApi();
            var count = 0;

            var tables = await queryApi.QueryAsync(flux, _org, cancellationToken);

            foreach (var table in tables)
            {
                foreach (var record in table.Records)
                {
                    count = GetIntValue(record, "_value");
                }
            }

            return count;
        }

        /// <summary>
        /// Build Flux query with filters and pagination
        /// </summary>
        private string BuildFluxQuery(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100000)
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
            query.AppendLine("  |> sort(columns: [\"_time\"], desc: true)");

            // Apply pagination
            var offset = (pageNumber - 1) * pageSize;
            if (offset > 0)
            {
                query.AppendLine($"  |> limit(n: {pageSize}, offset: {offset})");
            }
            else
            {
                query.AppendLine($"  |> limit(n: {pageSize})");
            }

            return query.ToString();
        }

        /// <summary>
        /// Build aggregated Flux query
        /// </summary>
        private string BuildAggregatedFluxQuery(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null,
            string aggregationInterval = "hour",
            string aggregationType = "avg")
        {
            var start = startDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var stop = endDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");

            // Map aggregation interval to duration
            var windowDuration = aggregationInterval switch
            {
                "minute" => "1m",
                "hour" => "1h",
                "day" => "1d",
                "week" => "1w",
                "month" => "30d",
                _ => "1h"
            };

            var query = new StringBuilder();
            query.AppendLine($"from(bucket: \"{_bucket}\")");
            query.AppendLine($"  |> range(start: {start}, stop: {stop})");
            query.AppendLine("  |> filter(fn: (r) => r._measurement == \"device_raw\")");
            query.AppendLine("  |> filter(fn: (r) => r._field == \"payload\")");

            // Optional filters
            if (!string.IsNullOrEmpty(deviceId))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.device == \"{deviceId}\")");
            }

            if (!string.IsNullOrEmpty(sensor))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.sensor == \"{sensor}\")");
            }

            // Convert payload to float for aggregation
            query.AppendLine("  |> map(fn: (r) => ({ r with _value: float(v: r._value) }))");

            // Apply aggregation
            query.AppendLine($"  |> aggregateWindow(every: {windowDuration}, fn: {aggregationType}, createEmpty: false)");
            query.AppendLine("  |> sort(columns: [\"_time\"], desc: true)");

            return query.ToString();
        }

        /// <summary>
        /// Build count Flux query
        /// </summary>
        private string BuildCountFluxQuery(
            DateTime startDateTime,
            DateTime endDateTime,
            string? deviceId = null,
            string? sensor = null)
        {
            var start = startDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var stop = endDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");

            var query = new StringBuilder();
            query.AppendLine($"from(bucket: \"{_bucket}\")");
            query.AppendLine($"  |> range(start: {start}, stop: {stop})");
            query.AppendLine("  |> filter(fn: (r) => r._measurement == \"device_raw\")");
            query.AppendLine("  |> filter(fn: (r) => r._field == \"payload\")");

            // Optional filters
            if (!string.IsNullOrEmpty(deviceId))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.device == \"{deviceId}\")");
            }

            if (!string.IsNullOrEmpty(sensor))
            {
                query.AppendLine($"  |> filter(fn: (r) => r.sensor == \"{sensor}\")");
            }

            query.AppendLine("  |> count()");
            query.AppendLine("  |> group()");
            query.AppendLine("  |> sum()");

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

        private int GetIntValue(FluxRecord record, string key)
        {
            var value = record.GetValueByKey(key);
            if (value == null) return 0;

            if (int.TryParse(value.ToString(), out var parsed))
                return parsed;

            if (long.TryParse(value.ToString(), out var parsedLong))
                return (int)parsedLong;

            return 0;
        }

        private decimal GetDecimalValue(FluxRecord record, string key)
        {
            var value = record.GetValueByKey(key);
            if (value == null) return 0;

            if (decimal.TryParse(value.ToString(), out var parsed))
                return parsed;

            if (double.TryParse(value.ToString(), out var parsedDouble))
                return (decimal)parsedDouble;

            return 0;
        }

        public void Dispose()
        {
            _client?.Dispose();
        }
    }
}
