using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllProductionUnitTypesHandler : BaseHandler, IRequestHandler<GetAllProductionUnitTypesQuery, Response<GetAllProductionUnitTypesResponse>>
    {
        private readonly IProductionUnitTypeQueryRepository _productionUnitTypeQueryRepository;
       

        public GetAllProductionUnitTypesHandler(IProductionUnitTypeQueryRepository productionUnitTypeQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _productionUnitTypeQueryRepository = productionUnitTypeQueryRepository;
        }

        public async Task<Response<GetAllProductionUnitTypesResponse>> Handle(GetAllProductionUnitTypesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllProductionUnitTypesValidator validator = new GetAllProductionUnitTypesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllProductionUnitTypesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _productionUnitTypeQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllProductionUnitTypesResponse getAllProductionUnitTypesResponse = new GetAllProductionUnitTypesResponse();
                    getAllProductionUnitTypesResponse.ProductionUnitTypes = getAllResult;
                    return new Response<GetAllProductionUnitTypesResponse>(getAllProductionUnitTypesResponse);
                }
                return new Response<GetAllProductionUnitTypesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllProductionUnitTypesResponse>(ex);
            }
        }
    }
}
