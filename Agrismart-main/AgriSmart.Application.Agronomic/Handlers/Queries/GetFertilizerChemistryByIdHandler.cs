using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetFertilizerChemistryByIdHandler : IRequestHandler<GetFertilizerChemistryByIdQuery, Response<GetFertilizerChemistryByIdResponse>>
    {
        private readonly IFertilizerChemistryQueryRepository _fertilizerChemistryQueryRepository;

        public GetFertilizerChemistryByIdHandler(IFertilizerChemistryQueryRepository fertilizerChemistryQueryRepository)
        {
            _fertilizerChemistryQueryRepository = fertilizerChemistryQueryRepository;
        }

        public async Task<Response<GetFertilizerChemistryByIdResponse>> Handle(GetFertilizerChemistryByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetFertilizerChemistryByIdValidator validator = new GetFertilizerChemistryByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetFertilizerChemistryByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _fertilizerChemistryQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetFertilizerChemistryByIdResponse getObjectByIdResponse = new GetFertilizerChemistryByIdResponse();
                    getObjectByIdResponse.FertilizerChemistry = getResult;
                    return new Response<GetFertilizerChemistryByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetFertilizerChemistryByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetFertilizerChemistryByIdResponse>(ex);
            }
        }
    }
}
