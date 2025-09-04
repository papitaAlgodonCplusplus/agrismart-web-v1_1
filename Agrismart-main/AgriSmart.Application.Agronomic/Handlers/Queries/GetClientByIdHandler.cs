using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetClientByIdHandler : IRequestHandler<GetClientByIdQuery, Response<GetClientByIdResponse>>
    {
        private readonly IClientQueryRepository _clientQueryRepository;

        public GetClientByIdHandler(IClientQueryRepository clientQueryRepository)
        {
            _clientQueryRepository = clientQueryRepository;             
        }

        public async Task<Response<GetClientByIdResponse>> Handle(GetClientByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetClientByIdValidator validator = new GetClientByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetClientByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _clientQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetClientByIdResponse getObjectByIdResponse = new GetClientByIdResponse();
                    getObjectByIdResponse.Client = getResult;
                    return new Response<GetClientByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetClientByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetClientByIdResponse>(ex);
            }
        }
    }
}
