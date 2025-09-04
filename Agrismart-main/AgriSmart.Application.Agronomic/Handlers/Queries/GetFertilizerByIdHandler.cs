using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetFertilizerByIdHandler : IRequestHandler<GetFertilizerByIdQuery, Response<GetFertilizerByIdResponse>>
    {
        private readonly IFertilizerQueryRepository _fertilizerQueryRepository;

        public GetFertilizerByIdHandler(IFertilizerQueryRepository fertilizerQueryRepository)
        {
            _fertilizerQueryRepository = fertilizerQueryRepository;
        }

        public async Task<Response<GetFertilizerByIdResponse>> Handle(GetFertilizerByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetFertilizerByIdValidator validator = new GetFertilizerByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetFertilizerByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _fertilizerQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetFertilizerByIdResponse getObjectByIdResponse = new GetFertilizerByIdResponse();
                    getObjectByIdResponse.Fertilizer = getResult;
                    return new Response<GetFertilizerByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetFertilizerByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetFertilizerByIdResponse>(ex);
            }
        }
    }
}
