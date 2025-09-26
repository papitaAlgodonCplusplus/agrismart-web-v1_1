using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropPhaseSolutionRequirementsByCropPhaseQuery : IRequest<Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>>
    {
        public int CropPhaseId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}