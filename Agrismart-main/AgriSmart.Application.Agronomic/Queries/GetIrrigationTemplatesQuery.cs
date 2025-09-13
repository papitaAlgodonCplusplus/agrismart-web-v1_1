using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationTemplatesQuery : IRequest<List<IrrigationTemplateDto>>
    {
        public int? CompanyId { get; set; }
        public string? SearchTerm { get; set; }
        
        public GetIrrigationTemplatesQuery(int? companyId = null, string? searchTerm = null)
        {
            CompanyId = companyId;
            SearchTerm = searchTerm;
        }
    }
}