using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetGrowingMediumByIdQuery : IRequest<Response<GetGrowingMediumByIdResponse>>
    {
        public int Id { get; set; }
    }
}