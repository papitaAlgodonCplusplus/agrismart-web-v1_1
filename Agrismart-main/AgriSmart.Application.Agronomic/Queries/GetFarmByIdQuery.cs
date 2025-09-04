using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetFarmByIdQuery : IRequest<Response<GetFarmByIdResponse>>
    {
        public int Id { get; set; }
    }
}