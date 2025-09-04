using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetFarmByIdHandler : IRequestHandler<GetFarmByIdQuery, Response<GetFarmByIdResponse>>
    {
        private readonly IFarmQueryRepository _farmQueryRepository;

        public GetFarmByIdHandler(IFarmQueryRepository farmQueryRepository)
        {
            _farmQueryRepository = farmQueryRepository;             
        }

        public async Task<Response<GetFarmByIdResponse>> Handle(GetFarmByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetFarmByIdValidator validator = new GetFarmByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetFarmByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _farmQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetFarmByIdResponse getObjectByIdResponse = new GetFarmByIdResponse();
                    getObjectByIdResponse.Farm = getResult;
                    return new Response<GetFarmByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetFarmByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetFarmByIdResponse>(ex);
            }
        }
    }
}
