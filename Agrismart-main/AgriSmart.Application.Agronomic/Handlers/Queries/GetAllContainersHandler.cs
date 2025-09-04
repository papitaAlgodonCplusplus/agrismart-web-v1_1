using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllContainersHandler : BaseHandler, IRequestHandler<GetAllContainersQuery, Response<GetAllContainersResponse>>
    {
        private readonly IContainerQueryRepository _containerQueryRepository;
       

        public GetAllContainersHandler(IContainerQueryRepository containerQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _containerQueryRepository = containerQueryRepository;
        }

        public async Task<Response<GetAllContainersResponse>> Handle(GetAllContainersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllContainersValidator validator = new GetAllContainersValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllContainersResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _containerQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllContainersResponse getAllContainersResponse = new GetAllContainersResponse();
                    getAllContainersResponse.Containers = getAllResult;
                    return new Response<GetAllContainersResponse>(getAllContainersResponse);
                }
                return new Response<GetAllContainersResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllContainersResponse>(ex);
            }
        }
    }
}
