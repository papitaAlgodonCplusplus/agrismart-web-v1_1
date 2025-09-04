using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAnalyticalEntityByIdQuery : IRequest<Response<GetAnalyticalEntityByIdResponse>>
    {
        public int Id { get; set; }
    }
}