using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    /// <summary>
    /// Handler to return all the companies that belong to the user session clientid
    /// </summary>
    public class GetAllClientsHandler : IRequestHandler<GetAllClientsQuery, Response<GetAllClientsResponse>>
    {
        private readonly IClientQueryRepository _clientQueryRepository;

        public GetAllClientsHandler(IClientQueryRepository clientQueryRepository)
        {
            _clientQueryRepository = clientQueryRepository;
        }

        public async Task<Response<GetAllClientsResponse>> Handle(GetAllClientsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllClientsValidator validator = new GetAllClientsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllClientsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _clientQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllClientsResponse getAllClientsResponse = new GetAllClientsResponse();
                    getAllClientsResponse.Clients = getAllResult;
                    return new Response<GetAllClientsResponse>(getAllClientsResponse);
                }
                return new Response<GetAllClientsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllClientsResponse>(ex);
            }
        }
    }
}
