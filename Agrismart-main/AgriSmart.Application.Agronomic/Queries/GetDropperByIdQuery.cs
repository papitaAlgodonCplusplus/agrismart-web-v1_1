using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetDropperByIdQuery : IRequest<Response<GetDropperByIdResponse>>
    {
        public int Id { get; set; }
    }
}