using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropProductionsQuery : IRequest<Response<GetAllCropProductionsResponse>>
    {
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}