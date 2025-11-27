using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceRawDataQueryRepository
    {
        // Existing methods
        Task<IReadOnlyList<DeviceRawData>> GetAllAsync(string deviceId);
        Task<IReadOnlyList<DeviceRawData>> GetAllAsync(
            string? deviceId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null, 
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100);
        
        Task<int> GetCountAsync(
            string? deviceId = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null, 
            string? sensor = null);
            
        Task<DeviceRawData?> GetByIdAsync(int id);
        
        // NEW: Aggregated data methods
        Task<IReadOnlyList<AggregatedDeviceData>> GetAggregatedDataAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            string aggregationInterval = "hour",
            string aggregationType = "avg",
            int pageNumber = 1,
            int pageSize = 1000);
            
        Task<int> GetAggregatedCountAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            string aggregationInterval = "hour");
    }
}