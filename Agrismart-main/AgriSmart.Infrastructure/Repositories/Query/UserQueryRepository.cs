using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class UserQueryRepository : BaseQueryRepository<User>, IUserQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public UserQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<User?> AuthenticateAsync(string? userEmail, string? userPassword)
        {
            try
            {
                return await _context.User
                    .Select(record => new User()
                    {
                        Id = record.Id,
                        ClientId = record.ClientId,
                        UserEmail = record.UserEmail, 
                        Password = record.Password,
                        ProfileId = record.ProfileId,
                        UserStatusId = record.UserStatusId
                    })
                    .Where(record => (record.UserEmail == userEmail && userEmail != null)
                        && (record.Password == userPassword && userPassword != null)
                        && record.UserStatusId == 1)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<User>> GetAllAsync(int profileId, int clientId, int userStatusId)
        {
            try
            {
                return await (from u in _context.User                             
                              where
                                  (
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser && u.Id == GetSessionUserId()) ||
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && ((u.ProfileId == profileId) || profileId == 0)
                                  && ((u.ClientId == clientId) || clientId == 0)
                                  && ((u.UserStatusId == userStatusId) || userStatusId == 0)                                  
                              select u).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            try
            {
                return await (from u in _context.User
                              where
                                  (
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser && u.Id == GetSessionUserId()) ||
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && (u.Id == id)
                              select u).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<User?> GetBySessionIdAsync()
        {
            try
            {
                return await (from u in _context.User
                              where
                                  (
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser && u.Id == GetSessionUserId()) ||
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && (u.Id == GetSessionUserId())
                              select u).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}