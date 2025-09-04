using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllProductionUnitsHandler : BaseHandler, IRequestHandler<GetAllProductionUnitsQuery, Response<GetAllProductionUnitsResponse>>
    {
        private readonly IProductionUnitQueryRepository _productionUnitQueryRepository;       

        public GetAllProductionUnitsHandler(IProductionUnitQueryRepository productionUnitQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _productionUnitQueryRepository = productionUnitQueryRepository;
        }

        public async Task<Response<GetAllProductionUnitsResponse>> Handle(GetAllProductionUnitsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllProductionUnitsValidator validator = new GetAllProductionUnitsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllProductionUnitsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _productionUnitQueryRepository.GetAllAsync(query.CompanyId, query.FarmId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllProductionUnitsResponse getAllProductionUnitsResponse = new GetAllProductionUnitsResponse();
                    getAllProductionUnitsResponse.ProductionUnits = getAllResult;
                    return new Response<GetAllProductionUnitsResponse>(getAllProductionUnitsResponse);
                }
                return new Response<GetAllProductionUnitsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllProductionUnitsResponse>(ex);
            }
        }
    }
}
