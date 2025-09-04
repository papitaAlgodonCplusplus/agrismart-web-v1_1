using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetGraphByIdQuery : IRequest<Response<GetGraphByIdResponse>>
    {
        public int Id { get; set; }
    }
}