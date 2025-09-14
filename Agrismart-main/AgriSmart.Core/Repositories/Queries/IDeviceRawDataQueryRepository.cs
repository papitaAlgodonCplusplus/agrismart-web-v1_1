using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceRawDataQueryRepository
    {
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
    }
}