using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Queries
{
    public record GetAllDevicesQuery : IRequest<Response<GetAllDevicesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}