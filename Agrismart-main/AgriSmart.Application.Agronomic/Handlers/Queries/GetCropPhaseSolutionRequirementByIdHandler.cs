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
    public class GetCropPhaseSolutionRequirementByIdHandler : BaseHandler, IRequestHandler<GetCropPhaseSolutionRequirementByIdQuery, Response<GetCropPhaseSolutionRequirementByIdResponse>>
    {
        private readonly ICropPhaseSolutionRequirementQueryRepository _cropPhaseSolutionRequirementQueryRepository;

        public GetCropPhaseSolutionRequirementByIdHandler(ICropPhaseSolutionRequirementQueryRepository cropPhaseSolutionRequirementQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _cropPhaseSolutionRequirementQueryRepository = cropPhaseSolutionRequirementQueryRepository;
        }

        public async Task<Response<GetCropPhaseSolutionRequirementByIdResponse>> Handle(GetCropPhaseSolutionRequirementByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropPhaseSolutionRequirementByIdValidator validator = new GetCropPhaseSolutionRequirementByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropPhaseSolutionRequirementByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropPhaseSolutionRequirementQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCropPhaseSolutionRequirementByIdResponse getObjectByIdResponse = new GetCropPhaseSolutionRequirementByIdResponse();
                    getObjectByIdResponse.CropPhaseSolutionRequirement = getResult;
                    return new Response<GetCropPhaseSolutionRequirementByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropPhaseSolutionRequirementByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropPhaseSolutionRequirementByIdResponse>(ex);
            }
        }
    }
}