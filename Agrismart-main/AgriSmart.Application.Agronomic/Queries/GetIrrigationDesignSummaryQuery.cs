
// Agrismart-main/AgriSmart.Application.Agronomic/Queries/
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationDesignSummaryQuery : IRequest<IrrigationDesignSummaryDto>
    {
        public int? ClientId { get; set; }
        public int? FarmId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool IncludeInactive { get; set; } = false;
    }
}