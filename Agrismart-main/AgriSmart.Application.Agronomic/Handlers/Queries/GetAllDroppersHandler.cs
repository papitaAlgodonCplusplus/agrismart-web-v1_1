using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllDroppersHandler : IRequestHandler<GetAllDroppersQuery, Response<GetAllDroppersResponse>>
    {
        private readonly IDropperQueryRepository _dropperQueryRepository;

        public GetAllDroppersHandler(IDropperQueryRepository dropperQueryRepository)
        {
            _dropperQueryRepository = dropperQueryRepository;
        }

        public async Task<Response<GetAllDroppersResponse>> Handle(GetAllDroppersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllDroppersValidator validator = new GetAllDroppersValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllDroppersResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _dropperQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllDroppersResponse getAllDroppersResponse = new GetAllDroppersResponse();
                    getAllDroppersResponse.Droppers = getAllResult;
                    return new Response<GetAllDroppersResponse>(getAllDroppersResponse);
                }
                return new Response<GetAllDroppersResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllDroppersResponse>(ex);
            }
        }
    }
}
