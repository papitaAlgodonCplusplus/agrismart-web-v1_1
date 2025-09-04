using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AgriSmart.Application.Agronomic.Handlers
{
    public class BaseHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BaseHandler(IHttpContextAccessor httpContextAccessor)
        { 
            _httpContextAccessor = httpContextAccessor;
        }

        protected int GetSessionUserId()
        {
            return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
        }
    }
}
