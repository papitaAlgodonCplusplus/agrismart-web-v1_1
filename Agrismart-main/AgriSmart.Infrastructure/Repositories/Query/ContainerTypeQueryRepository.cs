using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class ContainerTypeQueryRepository : BaseQueryRepository<ContainerType>, IContainerTypeQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public ContainerTypeQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<ContainerType>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from put in _context.ContainerType
                              where ((put.Active && !includeInactives) || includeInactives)
                              select put).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
