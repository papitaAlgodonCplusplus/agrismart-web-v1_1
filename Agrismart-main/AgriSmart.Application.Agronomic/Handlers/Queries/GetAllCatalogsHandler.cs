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
    public class GetAllCatalogsHandler : IRequestHandler<GetAllCatalogsQuery, Response<GetAllCatalogsResponse>>
    {
        private readonly ICatalogQueryRepository _catalogQueryRepository;

        public GetAllCatalogsHandler(ICatalogQueryRepository catalogQueryRepository)
        {
            _catalogQueryRepository = catalogQueryRepository;
        }

        public async Task<Response<GetAllCatalogsResponse>> Handle(GetAllCatalogsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCatalogsValidator validator = new GetAllCatalogsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCatalogsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _catalogQueryRepository.GetAllAsync(query.ClientId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCatalogsResponse getAllCatalogsResponse = new GetAllCatalogsResponse();
                    getAllCatalogsResponse.Catalogs = getAllResult;
                    return new Response<GetAllCatalogsResponse>(getAllCatalogsResponse);
                }
                return new Response<GetAllCatalogsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCatalogsResponse>(ex);
            }
        }
    }
}
