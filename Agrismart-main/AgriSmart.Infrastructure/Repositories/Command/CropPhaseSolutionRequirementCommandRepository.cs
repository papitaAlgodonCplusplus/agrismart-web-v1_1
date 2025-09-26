using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class CropPhaseSolutionRequirementCommandRepository : BaseCommandRepository<CropPhaseSolutionRequirement>, ICropPhaseSolutionRequirementCommandRepository
    {
        public CropPhaseSolutionRequirementCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {

        }
    }
}