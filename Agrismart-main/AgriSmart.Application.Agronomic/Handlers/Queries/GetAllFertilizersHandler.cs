using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllFertilizersHandler : IRequestHandler<GetAllFertilizersQuery, Response<GetAllFertilizersResponse>>
    {
        private readonly IFertilizerQueryRepository _fertilizerQueryRepository;

        public GetAllFertilizersHandler(IFertilizerQueryRepository fertilizerQueryRepository)
        {
            _fertilizerQueryRepository = fertilizerQueryRepository;
        }

        public async Task<Response<GetAllFertilizersResponse>> Handle(GetAllFertilizersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllFertilizersValidator validator = new GetAllFertilizersValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllFertilizersResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _fertilizerQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllFertilizersResponse getAllFertilizersResponse = new GetAllFertilizersResponse();
                    getAllFertilizersResponse.Fertilizers = getAllResult;
                    return new Response<GetAllFertilizersResponse>(getAllFertilizersResponse);
                }
                return new Response<GetAllFertilizersResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllFertilizersResponse>(ex);
            }
        }
    }
}
