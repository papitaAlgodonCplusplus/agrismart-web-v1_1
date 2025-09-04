using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllFarmsHandler : IRequestHandler<GetAllFarmsQuery, Response<GetAllFarmsResponse>>
    {
        private readonly IFarmQueryRepository _farmQueryRepository;

        public GetAllFarmsHandler(IFarmQueryRepository farmQueryRepository)
        {
            _farmQueryRepository = farmQueryRepository;
        }

        public async Task<Response<GetAllFarmsResponse>> Handle(GetAllFarmsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllFarmsValidator validator = new GetAllFarmsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllFarmsResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _farmQueryRepository.GetAllAsync(query.ClientId, query.CompanyId, query.UserId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllFarmsResponse getAllFarmsResponse = new GetAllFarmsResponse();
                    getAllFarmsResponse.Farms = getResult;
                    return new Response<GetAllFarmsResponse>(getAllFarmsResponse);
                }
                return new Response<GetAllFarmsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllFarmsResponse>(ex);
            }
        }
    }
}
