using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllAnalyticalEntitiesHandler : IRequestHandler<GetAllAnalyticalEntitiesQuery, Response<GetAllAnalyticalEntitiesResponse>>
    {
        private readonly IAnalyticalEntityQueryRepository _analiticalEntityQuery;

        public GetAllAnalyticalEntitiesHandler(IAnalyticalEntityQueryRepository analiticalEntityQuery)
        {
            _analiticalEntityQuery = analiticalEntityQuery;
        }

        public async Task<Response<GetAllAnalyticalEntitiesResponse>> Handle(GetAllAnalyticalEntitiesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllAnalyticalEntityValidator validator = new GetAllAnalyticalEntityValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllAnalyticalEntitiesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _analiticalEntityQuery.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllAnalyticalEntitiesResponse getAllAnaliticalEntitiesResponse = new GetAllAnalyticalEntitiesResponse();
                    getAllAnaliticalEntitiesResponse.AnaliticalEntities = getResult;
                    return new Response<GetAllAnalyticalEntitiesResponse>(getAllAnaliticalEntitiesResponse);
                }
                return new Response<GetAllAnalyticalEntitiesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllAnalyticalEntitiesResponse>(ex);
            }
        }
    }
}
