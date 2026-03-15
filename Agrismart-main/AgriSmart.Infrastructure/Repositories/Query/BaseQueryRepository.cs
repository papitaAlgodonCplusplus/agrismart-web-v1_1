
using AgriSmart.Core.Configuration;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Enums;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class BaseQueryRepository<T> : DbConnector, IBaseQueryRepository<T> where T : class
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public BaseQueryRepository(IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected int GetSessionUserId()
        {
            if (_httpContextAccessor.HttpContext.User.Claims.Count() > 0)
                return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            else
                return 0;
        }

        protected int GetSessionProfileId()
        {
            if (_httpContextAccessor.HttpContext.User.Claims.Count() > 0)
                return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role).Value);
            else
                return 0;
        }

        protected int GetSessionClientId()
        {
            if (_httpContextAccessor.HttpContext.User.Claims.Count() > 0)
                return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid).Value);
            else
                return 0;
        }

        /// <summary>
        /// Returns true for all client-scoped roles: ClientAdmin (2), TechnicianUser (5),
        /// AgronomistUser (6), and AgronomistTechnicianUser (7).
        /// These users see all data belonging to their client.
        /// </summary>
        protected bool IsClientLevelUser()
        {
            int profileId = GetSessionProfileId();
            return profileId == (int)Profiles.ClientAdmin
                || profileId == (int)Profiles.TechnicianUser
                || profileId == (int)Profiles.AgronomistUser
                || profileId == (int)Profiles.AgronomistTechnicianUser;
        }

        /// <summary>
        /// Returns true for CompanyUser (3) — farm-assigned access via UserFarm table.
        /// </summary>
        protected bool IsCompanyUser()
        {
            return GetSessionProfileId() == (int)Profiles.CompanyUser;
        }

        /// <summary>
        /// Returns true for SuperUser (1) — unrestricted access to all data.
        /// </summary>
        protected bool IsSuperUser()
        {
            return GetSessionProfileId() == (int)Profiles.SuperUser;
        }
    }
}
