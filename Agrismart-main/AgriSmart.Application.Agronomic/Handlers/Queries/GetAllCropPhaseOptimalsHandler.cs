using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropPhaseOptimalsHandler : BaseHandler, IRequestHandler<GetAllCropPhaseOptimalsQuery, Response<GetAllCropPhaseOptimalsResponse>>
    {
        private readonly ICropPhaseOptimalQueryRepository _cropPhaseOptimalQueryRepository;
       

        public GetAllCropPhaseOptimalsHandler(ICropPhaseOptimalQueryRepository cropPhaseOptimalQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _cropPhaseOptimalQueryRepository = cropPhaseOptimalQueryRepository;               
        }

        public async Task<Response<GetAllCropPhaseOptimalsResponse>> Handle(GetAllCropPhaseOptimalsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropPhaseOptimalsValidator validator = new GetAllCropPhaseOptimalsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropPhaseOptimalsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropPhaseOptimalQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCropPhaseOptimalsResponse getAllCropPhaseOptimalsResponse = new GetAllCropPhaseOptimalsResponse();
                    getAllCropPhaseOptimalsResponse.CropPhaseOptimals = getAllResult;
                    return new Response<GetAllCropPhaseOptimalsResponse>(getAllCropPhaseOptimalsResponse);
                }
                return new Response<GetAllCropPhaseOptimalsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropPhaseOptimalsResponse>(ex);
            }
        }
    }
}