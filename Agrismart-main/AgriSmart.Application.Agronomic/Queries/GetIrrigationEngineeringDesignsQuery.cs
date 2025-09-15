
// Agrismart-main/AgriSmart.Application.Agronomic/Queries/
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationEngineeringDesignsQuery : IRequest<List<IrrigationEngineeringDesignDto>>
    {
        public int? ClientId { get; set; }
        public int? FarmId { get; set; }
        public int? CropProductionId { get; set; }
        public string? DesignType { get; set; }
        public string? Status { get; set; }
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; } = true;
        public bool? IsTemplate { get; set; }
        public bool? RequiresRecalculation { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public decimal? MinArea { get; set; }
        public decimal? MaxArea { get; set; }
        public decimal? MinCost { get; set; }
        public decimal? MaxCost { get; set; }
        public bool? IsHydraulicallyValid { get; set; }
        public bool? IsEconomicallyViable { get; set; }
        public string? Tags { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "CreatedAt";
        public string? SortDirection { get; set; } = "desc";
    }
}
