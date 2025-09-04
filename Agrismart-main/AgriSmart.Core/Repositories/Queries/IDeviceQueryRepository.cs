using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceQueryRepository
    {
        Task<Device?> AuthenticateAsync(string? deviceId, string? devicePassword);
        Task<Device?> AuthenticateMqttClientAsync(string? connectUsername, string? connectPassword);
        Task<IReadOnlyList<Device>> GetAllAsync(int clientId = 0, int companyId = 0, int cropProductionId = 0, bool includeInactives = false);
        Task<IReadOnlyList<Device>> GetAllAsync(bool includeInactives = false);
        Task<Device?> GetByIdAsync(int id);
    }
}
