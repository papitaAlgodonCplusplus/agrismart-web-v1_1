using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllFertilizerInputsHandler : IRequestHandler<GetAllFertilizerInputsQuery, Response<GetAllFertilizerInputsResponse>>
    {
        private readonly IFertilizerInputQueryRepository _fertilizerInputsQueryRepository;

        public GetAllFertilizerInputsHandler(IFertilizerInputQueryRepository fertilizerInputQueryRepository)
        {
            _fertilizerInputsQueryRepository = fertilizerInputQueryRepository;
        }

        public async Task<Response<GetAllFertilizerInputsResponse>> Handle(GetAllFertilizerInputsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllFertilizerInputsValidator validator = new GetAllFertilizerInputsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllFertilizerInputsResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _fertilizerInputsQueryRepository.GetAllAsync(query.CatalogId, query.FertilizerId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllFertilizerInputsResponse getAllFertilizerInputsResponse = new GetAllFertilizerInputsResponse();
                    getAllFertilizerInputsResponse.FertilizerInputs = getResult;
                    return new Response<GetAllFertilizerInputsResponse>(getAllFertilizerInputsResponse);
                }
                return new Response<GetAllFertilizerInputsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllFertilizerInputsResponse>(ex);
            }
        }
    }
}
