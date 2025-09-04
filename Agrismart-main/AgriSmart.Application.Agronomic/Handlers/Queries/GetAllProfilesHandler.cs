using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllProfilesHandler : IRequestHandler<GetAllProfilesQuery, Response<GetAllProfilesResponse>>
    {
        private readonly IProfileQueryRepository _profileQueryRepository;

        public GetAllProfilesHandler(IProfileQueryRepository profileQueryRepository)
        {
             _profileQueryRepository = profileQueryRepository;
        }

        public async Task<Response<GetAllProfilesResponse>> Handle(GetAllProfilesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllProfilesValidator validator = new GetAllProfilesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllProfilesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _profileQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllProfilesResponse getAllProfilesResponse = new GetAllProfilesResponse();
                    getAllProfilesResponse.Profiles = getResult;
                    return new Response<GetAllProfilesResponse>(getAllProfilesResponse);
                }
                return new Response<GetAllProfilesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllProfilesResponse>(ex);
            }
        }
    }
}