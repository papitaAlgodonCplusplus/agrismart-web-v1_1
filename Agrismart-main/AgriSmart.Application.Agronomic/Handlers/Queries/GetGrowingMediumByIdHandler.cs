using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetGrowingMediumByIdHandler : IRequestHandler<GetGrowingMediumByIdQuery, Response<GetGrowingMediumByIdResponse>>
    {
        private readonly IGrowingMediumQueryRepository _growingMediumQueryRepository;

        public GetGrowingMediumByIdHandler(IGrowingMediumQueryRepository growingMediumQueryRepository)
        {
            _growingMediumQueryRepository = growingMediumQueryRepository;          
        }

        public async Task<Response<GetGrowingMediumByIdResponse>> Handle(GetGrowingMediumByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetGrowingMediumByIdValidator validator = new GetGrowingMediumByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetGrowingMediumByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _growingMediumQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetGrowingMediumByIdResponse getObjectByIdResponse = new GetGrowingMediumByIdResponse();
                    getObjectByIdResponse.GrowingMedium = getResult;
                    return new Response<GetGrowingMediumByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetGrowingMediumByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetGrowingMediumByIdResponse>(ex);
            }
        }
    }
}
