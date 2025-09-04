using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllContainerTypesHandler : BaseHandler, IRequestHandler<GetAllContainerTypesQuery, Response<GetAllContainerTypesResponse>>
    {
        private readonly IContainerTypeQueryRepository _containerTypeQueryRepository;
       

        public GetAllContainerTypesHandler(IContainerTypeQueryRepository containerTypeQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _containerTypeQueryRepository = containerTypeQueryRepository;
        }

        public async Task<Response<GetAllContainerTypesResponse>> Handle(GetAllContainerTypesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllContainerTypesValidator validator = new GetAllContainerTypesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllContainerTypesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _containerTypeQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllContainerTypesResponse getAllContainerTypesResponse = new GetAllContainerTypesResponse();
                    getAllContainerTypesResponse.ContainerTypes = getAllResult;
                    return new Response<GetAllContainerTypesResponse>(getAllContainerTypesResponse);
                }
                return new Response<GetAllContainerTypesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllContainerTypesResponse>(ex);
            }
        }
    }
}