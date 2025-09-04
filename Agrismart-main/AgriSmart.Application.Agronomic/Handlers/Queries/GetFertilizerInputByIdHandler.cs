using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetFertilizerInputByIdHandler : IRequestHandler<GetFertilizerInputByIdQuery, Response<GetFertilizerInputByIdResponse>>
    {
        private readonly IFertilizerInputQueryRepository _fertilizerInputQueryRepository;

        public GetFertilizerInputByIdHandler(IFertilizerInputQueryRepository fertilizerInputQueryRepository)
        {
            _fertilizerInputQueryRepository = fertilizerInputQueryRepository;
        }

        public async Task<Response<GetFertilizerInputByIdResponse>> Handle(GetFertilizerInputByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetFertilizerInputByIdValidator validator = new GetFertilizerInputByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetFertilizerInputByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _fertilizerInputQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetFertilizerInputByIdResponse getObjectByIdResponse = new GetFertilizerInputByIdResponse();
                    getObjectByIdResponse.FertilizerInput = getResult;
                    return new Response<GetFertilizerInputByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetFertilizerInputByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetFertilizerInputByIdResponse>(ex);
            }
        }
    }
}
