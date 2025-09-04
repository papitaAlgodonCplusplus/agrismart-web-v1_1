using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetGraphByIdHandler : IRequestHandler<GetGraphByIdQuery, Response<GetGraphByIdResponse>>
    {
        private readonly IGraphQueryRepository _graphQueryRepository;

        public GetGraphByIdHandler(IGraphQueryRepository graphQueryRepository)
        {
            _graphQueryRepository = graphQueryRepository;             
        }

        public async Task<Response<GetGraphByIdResponse>> Handle(GetGraphByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetGraphByIdValidator validator = new GetGraphByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetGraphByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _graphQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetGraphByIdResponse getObjectByIdResponse = new GetGraphByIdResponse();
                    getObjectByIdResponse.Graph = getResult;
                    return new Response<GetGraphByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetGraphByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetGraphByIdResponse>(ex);
            }
        }
    }
}
