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
    public class CropProductionRawDataCommandRepository : BaseCommandRepository<DeviceRawData>, ICropProductionRawDataCommandRepository
    {

        public CropProductionRawDataCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {

        }

        public async Task<int> ProcessCropProductionRawDataMeasurements(int cropProductionId)
        {
            try
            {
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter("@CropProductionId", cropProductionId));

                SqlParameter result = new SqlParameter();
                result.ParameterName = "@resultMessage";
                result.SqlDbType = SqlDbType.VarChar;
                result.Size = 128;
                result.Direction = ParameterDirection.Output;
                parameters.Add(result);

                _context.Database.SetCommandTimeout(600);

                return await _context.Database.ExecuteSqlRawAsync(@"EXEC ProcessDeviceRawData2 @CropProductionId, @resultMessage OUTPUT", parameters);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
