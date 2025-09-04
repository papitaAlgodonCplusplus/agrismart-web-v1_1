using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    /// <summary>
    /// Handler to return all the companies that belong to the user session RelayModuleid
    /// </summary>
    public class GetAllRelayModulesHandler : IRequestHandler<GetAllRelayModulesQuery, Response<GetAllRelayModulesResponse>>
    {
        private readonly IRelayModuleQueryRepository _relayModuleQueryRepository;

        public GetAllRelayModulesHandler(IRelayModuleQueryRepository relayModuleQueryRepository)
        {
            _relayModuleQueryRepository = relayModuleQueryRepository;
        }

        public async Task<Response<GetAllRelayModulesResponse>> Handle(GetAllRelayModulesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllRelayModulesValidator validator = new GetAllRelayModulesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllRelayModulesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _relayModuleQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllRelayModulesResponse getAllRelayModulesResponse = new GetAllRelayModulesResponse();
                    getAllRelayModulesResponse.RelayModules = getAllResult;
                    return new Response<GetAllRelayModulesResponse>(getAllRelayModulesResponse);
                }
                return new Response<GetAllRelayModulesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllRelayModulesResponse>(ex);
            }
        }
    }
}