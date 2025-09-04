using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAnaliticalEntityByIdHandler : IRequestHandler<GetAnalyticalEntityByIdQuery, Response<GetAnalyticalEntityByIdResponse>>
    {
        private readonly IAnalyticalEntityQueryRepository _analiticalEntityQuery;

        public GetAnaliticalEntityByIdHandler(IAnalyticalEntityQueryRepository analiticalEntityQuery)
        {
            _analiticalEntityQuery = analiticalEntityQuery;             
        }

        public async Task<Response<GetAnalyticalEntityByIdResponse>> Handle(GetAnalyticalEntityByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAnaliticalEntityByIdValidator validator = new GetAnaliticalEntityByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAnalyticalEntityByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _analiticalEntityQuery.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetAnalyticalEntityByIdResponse getObjectByIdResponse = new GetAnalyticalEntityByIdResponse();
                    getObjectByIdResponse.AnaliticalEntity = getResult;
                    return new Response<GetAnalyticalEntityByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetAnalyticalEntityByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAnalyticalEntityByIdResponse>(ex);
            }
        }
    }
}
