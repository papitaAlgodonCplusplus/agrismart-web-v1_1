using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetContainerByIdQuery : IRequest<Response<GetContainerByIdResponse>>
    {
        public int Id { get; set; }
    }
}