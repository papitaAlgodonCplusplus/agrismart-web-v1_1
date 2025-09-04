using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IIrrigationEventCommandRepository 
    {
        Task<IrrigationEvent> CreateAsync(IrrigationEvent irrigationEvent);
    }
}
