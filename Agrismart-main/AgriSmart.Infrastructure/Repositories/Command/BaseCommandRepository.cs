using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class BaseCommandRepository<T> : IBaseCommandRepository<T> where T : class
    {
        protected readonly AgriSmartContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BaseCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<T> CreateAsync(T entity)
        {           
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(T entity)
        {
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public int GetSessionUserId()
        {
            return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
        }

        public int GetSessionProfileId()
        {
            return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role).Value);
        }

        public int GetSessionClientId()
        {
            return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid).Value);
        }
    }
}