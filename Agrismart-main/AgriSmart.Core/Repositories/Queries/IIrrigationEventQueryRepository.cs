using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationEventQueryRepository
    {
        Task<IReadOnlyList<IrrigationEvent>> GetAllAsync(int CropProductionId, DateTime StartindDateTime, DateTime EndingDateTime);
    }
}
