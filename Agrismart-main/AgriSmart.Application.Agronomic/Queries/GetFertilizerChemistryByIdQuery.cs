using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetFertilizerChemistryByIdQuery : IRequest<Response<GetFertilizerChemistryByIdResponse>>
    {
        public int Id { get; set; }
    }
}