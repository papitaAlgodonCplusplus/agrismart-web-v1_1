using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Queries
{
    public record GetAllSensorsQuery : IRequest<Response<GetAllSensorsResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}