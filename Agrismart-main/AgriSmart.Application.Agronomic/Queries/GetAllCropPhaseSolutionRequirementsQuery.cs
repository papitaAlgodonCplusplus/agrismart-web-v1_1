using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropPhaseSolutionRequirementsQuery : IRequest<Response<GetAllCropPhaseSolutionRequirementsResponse>>
    {
        public int? CropPhaseId { get; set; }
        public int? PhaseId { get; set; }
        public bool IncludeInactives { get; set; }
        public bool IncludeValidatedOnly { get; set; }
    }
}