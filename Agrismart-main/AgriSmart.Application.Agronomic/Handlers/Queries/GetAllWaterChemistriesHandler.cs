using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllWaterChemistriesHandler : IRequestHandler<GetAllWaterChemistriesQuery, Response<GetAllWaterChemistriesResponse>>
    {
        private readonly IWaterChemistryQueryRepository _WaterChemistryQueryRepository;

        public GetAllWaterChemistriesHandler(IWaterChemistryQueryRepository WaterChemistryQueryRepository)
        {
            _WaterChemistryQueryRepository = WaterChemistryQueryRepository;
        }

        public async Task<Response<GetAllWaterChemistriesResponse>> Handle(GetAllWaterChemistriesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllWaterChemistriesValidator validator = new GetAllWaterChemistriesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllWaterChemistriesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _WaterChemistryQueryRepository.GetAllAsync(query.WaterId, query.CatalogId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllWaterChemistriesResponse getAllWaterChemistriesResponse = new GetAllWaterChemistriesResponse();
                    getAllWaterChemistriesResponse.WaterChemistries = getResult;
                    return new Response<GetAllWaterChemistriesResponse>(getAllWaterChemistriesResponse);
                }
                return new Response<GetAllWaterChemistriesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllWaterChemistriesResponse>(ex);
            }
        }
    }
}
