using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateIrrigationDesignCommand : IRequest<IrrigationDesignDto>
    {
        public int Id { get; set; }
        public IrrigationDesignDto IrrigationDesign { get; set; }
        
        public UpdateIrrigationDesignCommand(int id, IrrigationDesignDto irrigationDesign)
        {
            Id = id;
            IrrigationDesign = irrigationDesign;
        }
    }
}