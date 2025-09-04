using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetTimeZoneByIdQuery : IRequest<Response<GetTimeZoneByIdResponse>>
    {
        public int Id { get; set; }
    }
}