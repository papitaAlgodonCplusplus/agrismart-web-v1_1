using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateIrrigationDesignCommand : IRequest<IrrigationDesignDto>
    {
        public IrrigationDesignDto IrrigationDesign { get; set; }
        
        public CreateIrrigationDesignCommand(IrrigationDesignDto irrigationDesign)
        {
            IrrigationDesign = irrigationDesign;
        }
    }
}