using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;
using FluentValidation.Validators;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class IrrigationMeasurementQueryRepository : BaseQueryRepository<IrrigationMeasurement>, IIrrigationMeasurementQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public IrrigationMeasurementQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<IrrigationMeasurement>> GetAllAsync(int cropProductionId, DateTime startingDateTime, DateTime endigDateTime)
        {
            try
            {
                return await (from iev in _context.IrrigationEvent
                              join iem in _context.IrrigationMeasurement on iev.Id equals iem.EventId
                              where
                                  ((iev.CropProductionId == cropProductionId) || cropProductionId == 0) 
                                  && iev.DateTimeEnd >= startingDateTime && iev.RecordDateTime <= endigDateTime
                              select iem).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
