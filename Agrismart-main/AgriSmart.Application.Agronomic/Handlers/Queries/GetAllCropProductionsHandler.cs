using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropProductionsHandler : IRequestHandler<GetAllCropProductionsQuery, Response<GetAllCropProductionsResponse>>
    {
        private readonly ICropProductionQueryRepository _cropProductionQueryRepository;

        public GetAllCropProductionsHandler(ICropProductionQueryRepository cropProductionQueryRepository)
        {
            _cropProductionQueryRepository = cropProductionQueryRepository;
        }

        public async Task<Response<GetAllCropProductionsResponse>> Handle(GetAllCropProductionsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropProductionsValidator validator = new GetAllCropProductionsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropProductionsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropProductionQueryRepository.GetAllAsync(query.ClientId, query.CompanyId, query.FarmId, query.ProductionUnitId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCropProductionsResponse getAllCropProductionsResponse = new GetAllCropProductionsResponse();
                    getAllCropProductionsResponse.CropProductions = getAllResult;
                    return new Response<GetAllCropProductionsResponse>(getAllCropProductionsResponse);
                }
                return new Response<GetAllCropProductionsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropProductionsResponse>(ex);
            }
        }
    }
}
