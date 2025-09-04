using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetWaterChemistryByIdHandler : IRequestHandler<GetWaterChemistryByIdQuery, Response<GetWaterChemistryByIdResponse>>
    {
        private readonly IWaterChemistryQueryRepository _WaterChemistryQueryRepository;

        public GetWaterChemistryByIdHandler(IWaterChemistryQueryRepository WaterChemistryQueryRepository)
        {
            _WaterChemistryQueryRepository = WaterChemistryQueryRepository;
        }

        public async Task<Response<GetWaterChemistryByIdResponse>> Handle(GetWaterChemistryByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetWaterChemistryByIdValidator validator = new GetWaterChemistryByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetWaterChemistryByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _WaterChemistryQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetWaterChemistryByIdResponse getObjectByIdResponse = new GetWaterChemistryByIdResponse();
                    getObjectByIdResponse.WaterChemistry = getResult;
                    return new Response<GetWaterChemistryByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetWaterChemistryByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetWaterChemistryByIdResponse>(ex);
            }
        }
    }
}
