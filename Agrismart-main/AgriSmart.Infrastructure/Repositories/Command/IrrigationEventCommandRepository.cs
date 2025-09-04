using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;
using System.Reflection.Metadata;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class IrrigationEventCommandRepository : BaseCommandRepository<IrrigationEvent>, IIrrigationEventCommandRepository
    {
        //AgriSmartContext _agriSmartContext;

        public IrrigationEventCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {

        }

        public async Task<IrrigationEvent> CreateAsync(IrrigationEvent irrigationEvent)
        {
            var transaction = _context.Database.BeginTransaction();

            try
            {
                _context.IrrigationEvent.AddAsync(irrigationEvent);
                _context.SaveChanges();
                irrigationEvent.IrrigationMeasurements.ForEach(x => x.EventId = irrigationEvent.Id);
                _context.IrrigationMeasurement.AddRangeAsync(irrigationEvent.IrrigationMeasurements);
                _context.SaveChanges();

                transaction.Commit();


                return irrigationEvent;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}