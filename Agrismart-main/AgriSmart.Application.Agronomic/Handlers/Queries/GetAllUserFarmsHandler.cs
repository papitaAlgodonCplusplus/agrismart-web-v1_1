using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllUserFarmsHandler : IRequestHandler<GetAllUserFarmsQuery, Response<GetAllUserFarmsResponse>>
    {
        private readonly IUserFarmQueryRepository _userFarmQueryRepository;

        public GetAllUserFarmsHandler(IUserFarmQueryRepository userFarmQueryRepository)
        {
            _userFarmQueryRepository = userFarmQueryRepository;
        }

        public async Task<Response<GetAllUserFarmsResponse>> Handle(GetAllUserFarmsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllUserFarmsValidator validator = new GetAllUserFarmsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllUserFarmsResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _userFarmQueryRepository.GetAllAsync(query.UserId);

                if (getResult != null)
                {
                    GetAllUserFarmsResponse getAllUserFarmsResponse = new GetAllUserFarmsResponse();
                    getAllUserFarmsResponse.UserFarms = getResult;
                    return new Response<GetAllUserFarmsResponse>(getAllUserFarmsResponse);
                }
                return new Response<GetAllUserFarmsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllUserFarmsResponse>(ex);
            }
        }
    }
}