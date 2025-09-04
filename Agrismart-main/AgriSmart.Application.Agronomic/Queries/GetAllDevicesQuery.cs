using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllDevicesQuery : IRequest<Response<GetAllDevicesResponse>>
    {
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int CropProductionId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}