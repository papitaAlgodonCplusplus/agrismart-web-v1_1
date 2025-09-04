using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetRelayModuleByIdHandler : IRequestHandler<GetRelayModuleByIdQuery, Response<GetRelayModuleByIdResponse>>
    {
        private readonly IRelayModuleQueryRepository _relayModuleQueryRepository;

        public GetRelayModuleByIdHandler(IRelayModuleQueryRepository relayModuleQueryRepository)
        {
            _relayModuleQueryRepository = relayModuleQueryRepository;             
        }

        public async Task<Response<GetRelayModuleByIdResponse>> Handle(GetRelayModuleByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetRelayModuleByIdValidator validator = new GetRelayModuleByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetRelayModuleByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _relayModuleQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetRelayModuleByIdResponse getObjectByIdResponse = new GetRelayModuleByIdResponse();
                    getObjectByIdResponse.RelayModule = getResult;
                    return new Response<GetRelayModuleByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetRelayModuleByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetRelayModuleByIdResponse>(ex);
            }
        }
    }
}