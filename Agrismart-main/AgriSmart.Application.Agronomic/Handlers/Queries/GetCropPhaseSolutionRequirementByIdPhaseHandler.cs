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
    public class GetCropPhaseSolutionRequirementByIdPhaseHandler : BaseHandler, IRequestHandler<GetCropPhaseSolutionRequirementByIdPhaseQuery, Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>>
    {
        private readonly ICropPhaseSolutionRequirementQueryRepository _cropPhaseSolutionRequirementQueryRepository;
       

        public GetCropPhaseSolutionRequirementByIdPhaseHandler(ICropPhaseSolutionRequirementQueryRepository cropPhaseRequirementQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _cropPhaseSolutionRequirementQueryRepository = cropPhaseRequirementQueryRepository;               
        }

        public async Task<Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>> Handle(GetCropPhaseSolutionRequirementByIdPhaseQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropPhaseSolutionRequirementValidator validator = new GetCropPhaseSolutionRequirementValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropPhaseSolutionRequirementQueryRepository.GetByIdPhaseAsync(query.PhaseId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetCropPhaseSolutionRequirementByIdPhaseResponse getObjectByIdResponse = new GetCropPhaseSolutionRequirementByIdPhaseResponse();
                    getObjectByIdResponse.CropPhaseSolutionRequirement = getResult;
                    return new Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>(ex);
            }
        }
    }
}