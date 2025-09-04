
using AgriSmart.Core.Configuration;
using AgriSmart.Core.Entities;
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


    }
}
