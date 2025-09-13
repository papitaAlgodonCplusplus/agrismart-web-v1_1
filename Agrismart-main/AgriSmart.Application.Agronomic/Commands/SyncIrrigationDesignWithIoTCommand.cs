using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class SyncIrrigationDesignWithIoTCommand : IRequest<IoTSyncResultDto>
    {
        public int IrrigationDesignId { get; set; }
        
        public SyncIrrigationDesignWithIoTCommand(int irrigationDesignId)
        {
            IrrigationDesignId = irrigationDesignId;
        }
    }
}