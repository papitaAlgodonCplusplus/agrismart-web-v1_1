using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetClientByIdQuery : IRequest<Response<GetClientByIdResponse>>
    {
        public int Id { get; set; }
    }
}