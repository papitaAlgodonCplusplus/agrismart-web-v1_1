using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationRequestsQueryRepository
    {
        Task<IReadOnlyList<IrrigationRequest>> GetAllAsync(int clientId = 0, int companyId = 0, int FarmId = 0, int productionUnitId = 0);

    }
}
