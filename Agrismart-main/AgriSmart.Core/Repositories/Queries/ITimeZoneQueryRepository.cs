using AgriSmart.Core.Entities;
using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ITimeZoneQueryRepository
    {
        Task<IReadOnlyList<TimeZone>> GetAllAsync(bool includeInactives = false);
        Task<TimeZone> GetByIdAsync(int Id); 
    }
}
