using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropPhaseSolutionRequirementByIdQuery : IRequest<Response<GetCropPhaseSolutionRequirementByIdResponse>>
    {
        public int Id { get; set; }
    }
}