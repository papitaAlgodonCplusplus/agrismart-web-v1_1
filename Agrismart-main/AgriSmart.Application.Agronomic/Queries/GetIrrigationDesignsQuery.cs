using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationDesignsQuery : IRequest<List<IrrigationDesignDto>>
    {
        public int? CompanyId { get; set; }
        public string? SearchTerm { get; set; }
        
        public GetIrrigationDesignsQuery(int? companyId = null, string? searchTerm = null)
        {
            CompanyId = companyId;
            SearchTerm = searchTerm;
        }
    }
}