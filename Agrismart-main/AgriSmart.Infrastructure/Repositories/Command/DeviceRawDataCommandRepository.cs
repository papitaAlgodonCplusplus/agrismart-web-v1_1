using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
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
                var parameters = new List<NpgsqlParameter>();
                parameters.Add(new NpgsqlParameter("deviceId", deviceId));

                NpgsqlParameter result = new NpgsqlParameter();
                result.ParameterName = "resultMessage";
                result.NpgsqlDbType = NpgsqlDbType.Varchar;
                result.Size = 128;
                result.Direction = ParameterDirection.Output;
                parameters.Add(result);

                _context.Database.SetCommandTimeout(600);

                return await _context.Database.ExecuteSqlRawAsync(@"CALL ""ProcessDeviceRawData2""($1, $2)", parameters);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
