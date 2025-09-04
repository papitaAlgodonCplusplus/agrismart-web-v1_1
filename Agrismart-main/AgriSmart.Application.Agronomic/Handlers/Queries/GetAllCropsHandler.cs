using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropsHandler : BaseHandler, IRequestHandler<GetAllCropsQuery, Response<GetAllCropsResponse>>
    {
        private readonly ICropQueryRepository _cropQueryRepository;
       

        public GetAllCropsHandler(ICropQueryRepository cropQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _cropQueryRepository = cropQueryRepository;               
        }

        public async Task<Response<GetAllCropsResponse>> Handle(GetAllCropsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropsValidator validator = new GetAllCropsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCropsResponse getAllCropsResponse = new GetAllCropsResponse();
                    getAllCropsResponse.Crops = getAllResult;
                    return new Response<GetAllCropsResponse>(getAllCropsResponse);
                }
                return new Response<GetAllCropsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropsResponse>(ex);
            }
        }
    }
}
