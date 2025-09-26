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
    public class GetCropPhaseSolutionRequirementsByCropPhaseHandler : BaseHandler, IRequestHandler<GetCropPhaseSolutionRequirementsByCropPhaseQuery, Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>>
    {
        private readonly ICropPhaseSolutionRequirementQueryRepository _cropPhaseSolutionRequirementQueryRepository;

        public GetCropPhaseSolutionRequirementsByCropPhaseHandler(ICropPhaseSolutionRequirementQueryRepository cropPhaseSolutionRequirementQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _cropPhaseSolutionRequirementQueryRepository = cropPhaseSolutionRequirementQueryRepository;
        }

        public async Task<Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>> Handle(GetCropPhaseSolutionRequirementsByCropPhaseQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropPhaseSolutionRequirementsByCropPhaseValidator validator = new GetCropPhaseSolutionRequirementsByCropPhaseValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropPhaseSolutionRequirementQueryRepository.GetByCropPhaseAsync(query.CropPhaseId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetCropPhaseSolutionRequirementsByCropPhaseResponse getResponse = new GetCropPhaseSolutionRequirementsByCropPhaseResponse();
                    getResponse.CropPhaseSolutionRequirements = getResult;
                    return new Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>(getResponse);
                }
                return new Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>(ex);
            }
        }
    }
}