using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetProductionUnitByIdQuery : IRequest<Response<GetProductionUnitByIdResponse>>
    {
        public int Id { get; set; }
    }
}