using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropPhasesHandler : BaseHandler, IRequestHandler<GetAllCropPhasesQuery, Response<GetAllCropPhasesResponse>>
    {
        private readonly ICropPhaseQueryRepository _cropPhaseQueryRepository;
       

        public GetAllCropPhasesHandler(ICropPhaseQueryRepository cropPhaseQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _cropPhaseQueryRepository = cropPhaseQueryRepository;               
        }

        public async Task<Response<GetAllCropPhasesResponse>> Handle(GetAllCropPhasesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropPhasesValidator validator = new GetAllCropPhasesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropPhasesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropPhaseQueryRepository.GetAllAsync(query.CropId, query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCropPhasesResponse getAllCropPhasesResponse = new GetAllCropPhasesResponse();
                    getAllCropPhasesResponse.CropPhases = getAllResult;
                    return new Response<GetAllCropPhasesResponse>(getAllCropPhasesResponse);
                }
                return new Response<GetAllCropPhasesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropPhasesResponse>(ex);
            }
        }
    }
}
