using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllGraphsHandler : IRequestHandler<GetAllGraphsQuery, Response<GetAllGraphsResponse>>
    {
        private readonly IGraphQueryRepository _graphQueryRepository;

        public GetAllGraphsHandler(IGraphQueryRepository graphQueryRepository)
        {
            _graphQueryRepository = graphQueryRepository;
        }

        public async Task<Response<GetAllGraphsResponse>> Handle(GetAllGraphsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllGraphsValidator validator = new GetAllGraphsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllGraphsResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _graphQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllGraphsResponse getAllGraphsResponse = new GetAllGraphsResponse();
                    getAllGraphsResponse.Graphs = getResult;
                    return new Response<GetAllGraphsResponse>(getAllGraphsResponse);
                }
                return new Response<GetAllGraphsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllGraphsResponse>(ex);
            }
        }
    }
}
