using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllSensorsQuery : IRequest<Response<GetAllSensorsResponse>>
    {
        public int CompanyId { get; set; } = 0;
        public int DeviceId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}