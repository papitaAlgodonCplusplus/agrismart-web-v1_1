
// Agrismart-main/AgriSmart.Application.Agronomic/Queries/
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationEngineeringDesignByIdQuery : IRequest<IrrigationEngineeringDesignDetailDto?>
    {
        public int Id { get; set; }
        public bool IncludeInactive { get; set; } = false;
    }
}
