using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropPhaseSolutionRequirementByIdPhaseQuery : IRequest<Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>>
    {
        public int PhaseId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}