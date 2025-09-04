using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetWaterChemistryByIdQuery : IRequest<Response<GetWaterChemistryByIdResponse>>
    {
        public int Id { get; set; }
    }
}