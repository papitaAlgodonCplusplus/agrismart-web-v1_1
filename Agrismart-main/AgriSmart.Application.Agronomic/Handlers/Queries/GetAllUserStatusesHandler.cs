using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllUserStatusesHandler : IRequestHandler<GetAllUserStatusesQuery, Response<GetAllUserStatusesResponse>>
    {
        private readonly IUserStatusQueryRepository _userStatusQueryRepository;

        public GetAllUserStatusesHandler(IUserStatusQueryRepository userStatusQueryRepository)
        {
             _userStatusQueryRepository = userStatusQueryRepository;
        }

        public async Task<Response<GetAllUserStatusesResponse>> Handle(GetAllUserStatusesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllUserStatusesValidator validator = new GetAllUserStatusesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllUserStatusesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _userStatusQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllUserStatusesResponse getAllUserStatusesResponse = new GetAllUserStatusesResponse();
                    getAllUserStatusesResponse.UserStatuses = getResult;
                    return new Response<GetAllUserStatusesResponse>(getAllUserStatusesResponse);
                }
                return new Response<GetAllUserStatusesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllUserStatusesResponse>(ex);
            }
        }
    }
}