using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCatalogByIdHandler : IRequestHandler<GetCatalogByIdQuery, Response<GetCatalogByIdResponse>>
    {
        private readonly ICatalogQueryRepository _catalogQueryRepository;

        public GetCatalogByIdHandler(ICatalogQueryRepository catalogQueryRepository)
        {
            _catalogQueryRepository = catalogQueryRepository;        
        }

        public async Task<Response<GetCatalogByIdResponse>> Handle(GetCatalogByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCatalogByIdValidator validator = new GetCatalogByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCatalogByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _catalogQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCatalogByIdResponse getObjectByIdResponse = new GetCatalogByIdResponse();
                    getObjectByIdResponse.Catalog = getResult;
                    return new Response<GetCatalogByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCatalogByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCatalogByIdResponse>(ex);
            }
        }
    }
}
