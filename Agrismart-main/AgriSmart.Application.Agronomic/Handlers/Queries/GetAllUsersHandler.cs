using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, Response<GetAllUsersResponse>>
    {
        private readonly IUserQueryRepository _userQueryRepository;

        public GetAllUsersHandler(IUserQueryRepository userQueryRepository)
        {
             _userQueryRepository = userQueryRepository;
        }

        public async Task<Response<GetAllUsersResponse>> Handle(GetAllUsersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllUsersValidator validator = new GetAllUsersValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllUsersResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _userQueryRepository.GetAllAsync(query.ProfileId, query.ClientId, query.UserStatusId);

                if (getResult != null)
                {
                    GetAllUsersResponse getAllUsersResponse = new GetAllUsersResponse();
                    getAllUsersResponse.Users = getResult;
                    return new Response<GetAllUsersResponse>(getAllUsersResponse);
                }
                return new Response<GetAllUsersResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllUsersResponse>(ex);
            }
        }
    }
}