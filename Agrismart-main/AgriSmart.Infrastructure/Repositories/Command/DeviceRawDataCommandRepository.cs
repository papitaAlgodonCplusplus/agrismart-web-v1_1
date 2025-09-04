using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.Repositories.Queries;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class DeviceRawDataCommandRepository : BaseCommandRepository<DeviceRawData>, IDeviceRawDataCommandRepository
    {

        public DeviceRawDataCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
            
        }

        public async Task<int> ProcessDeviceRawDataMeasurements(int deviceId)
        {
            try
            {
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter("@deviceId", deviceId));

                SqlParameter result = new SqlParameter();
                result.ParameterName = "@resultMessage";
                result.SqlDbType = SqlDbType.NVarChar;
                result.Size = 128;
                result.Direction = ParameterDirection.Output;
                parameters.Add(result);

                _context.Database.SetCommandTimeout(600);

                return await _context.Database.ExecuteSqlRawAsync(@"exec [ProcessDeviceRawData2] @deviceId, @resultMessage", parameters);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
