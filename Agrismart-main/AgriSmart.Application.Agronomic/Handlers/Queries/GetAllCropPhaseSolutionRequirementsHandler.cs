using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropPhaseSolutionRequirementsHandler : BaseHandler, IRequestHandler<GetAllCropPhaseSolutionRequirementsQuery, Response<GetAllCropPhaseSolutionRequirementsResponse>>
    {
        private readonly ICropPhaseSolutionRequirementQueryRepository _cropPhaseSolutionRequirementQueryRepository;

        public GetAllCropPhaseSolutionRequirementsHandler(ICropPhaseSolutionRequirementQueryRepository cropPhaseSolutionRequirementQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _cropPhaseSolutionRequirementQueryRepository = cropPhaseSolutionRequirementQueryRepository;
        }

        public async Task<Response<GetAllCropPhaseSolutionRequirementsResponse>> Handle(GetAllCropPhaseSolutionRequirementsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropPhaseSolutionRequirementsValidator validator = new GetAllCropPhaseSolutionRequirementsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropPhaseSolutionRequirementsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropPhaseSolutionRequirementQueryRepository.GetAllAsync(query.CropPhaseId, query.PhaseId, query.IncludeInactives, query.IncludeValidatedOnly);

                if (getAllResult != null)
                {
                    GetAllCropPhaseSolutionRequirementsResponse getAllResponse = new GetAllCropPhaseSolutionRequirementsResponse();
                    getAllResponse.CropPhaseRequirements = getAllResult;
                    return new Response<GetAllCropPhaseSolutionRequirementsResponse>(getAllResponse);
                }
                return new Response<GetAllCropPhaseSolutionRequirementsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropPhaseSolutionRequirementsResponse>(ex);
            }
        }
    }
}