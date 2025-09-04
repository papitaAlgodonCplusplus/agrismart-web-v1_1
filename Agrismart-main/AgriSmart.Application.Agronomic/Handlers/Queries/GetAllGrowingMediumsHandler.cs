using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllGrowingMediumsHandler : BaseHandler, IRequestHandler<GetAllGrowingMediumsQuery, Response<GetAllGrowingMediumsResponse>>
    {
        private readonly IGrowingMediumQueryRepository _growingMediumQueryRepository;
       

        public GetAllGrowingMediumsHandler(IGrowingMediumQueryRepository growingMediumQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _growingMediumQueryRepository = growingMediumQueryRepository;             
        }

        public async Task<Response<GetAllGrowingMediumsResponse>> Handle(GetAllGrowingMediumsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllGrowingMediumsValidator validator = new GetAllGrowingMediumsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllGrowingMediumsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _growingMediumQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllGrowingMediumsResponse getAllGrowingMediumsResponse = new GetAllGrowingMediumsResponse();
                    getAllGrowingMediumsResponse.GrowingMediums = getAllResult;
                    return new Response<GetAllGrowingMediumsResponse>(getAllGrowingMediumsResponse);
                }
                return new Response<GetAllGrowingMediumsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllGrowingMediumsResponse>(ex);
            }
        }
    }
}
