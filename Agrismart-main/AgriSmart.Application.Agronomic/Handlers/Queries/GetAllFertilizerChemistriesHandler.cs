using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllFertilizerChemistriesHandler : IRequestHandler<GetAllFertilizerChemistriesQuery, Response<GetAllFertilizerChemistriesResponse>>
    {
        private readonly IFertilizerChemistryQueryRepository _fertilizerChemistryQueryRepository;

        public GetAllFertilizerChemistriesHandler(IFertilizerChemistryQueryRepository fertilizerChemistryQueryRepository)
        {
            _fertilizerChemistryQueryRepository = fertilizerChemistryQueryRepository;
        }

        public async Task<Response<GetAllFertilizerChemistriesResponse>> Handle(GetAllFertilizerChemistriesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllFertilizerChemistriesValidator validator = new GetAllFertilizerChemistriesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllFertilizerChemistriesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _fertilizerChemistryQueryRepository.GetAllAsync(query.FertilizerId, query.CatalogId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllFertilizerChemistriesResponse getAllFertilizerChemistriesResponse = new GetAllFertilizerChemistriesResponse();
                    getAllFertilizerChemistriesResponse.FertilizerChemistries = getResult;
                    return new Response<GetAllFertilizerChemistriesResponse>(getAllFertilizerChemistriesResponse);
                }
                return new Response<GetAllFertilizerChemistriesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllFertilizerChemistriesResponse>(ex);
            }
        }
    }
}
