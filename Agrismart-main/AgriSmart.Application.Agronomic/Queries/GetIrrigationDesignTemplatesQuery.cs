
// Agrismart-main/AgriSmart.Application.Agronomic/Queries/
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationDesignTemplatesQuery : IRequest<List<IrrigationEngineeringDesignDto>>
    {
        public string? DesignType { get; set; }
        public bool PublicOnly { get; set; } = false;
        public int? CreatedBy { get; set; }
        public string? SearchTerm { get; set; }
    }
}