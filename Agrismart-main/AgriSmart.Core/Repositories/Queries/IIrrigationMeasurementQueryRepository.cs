using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationMeasurementQueryRepository
    {
        Task<IReadOnlyList<IrrigationMeasurement>> GetAllAsync(int CropProductionId, DateTime StartindDateTime, DateTime EndingDateTime);
    }
}
