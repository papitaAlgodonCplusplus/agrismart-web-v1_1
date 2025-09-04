using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface ICropProductionRawDataCommandRepository : IBaseCommandRepository<DeviceRawData>
    {
        Task<int> ProcessCropProductionRawDataMeasurements(int cropProductionId);
    }
}
