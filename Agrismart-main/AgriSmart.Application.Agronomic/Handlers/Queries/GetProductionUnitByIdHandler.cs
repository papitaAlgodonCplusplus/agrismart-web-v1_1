using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetProductionUnitByIdHandler : IRequestHandler<GetProductionUnitByIdQuery, Response<GetProductionUnitByIdResponse>>
    {
        private readonly IProductionUnitQueryRepository _productionUnitQueryRepository;

        public GetProductionUnitByIdHandler(IProductionUnitQueryRepository productionUnitQueryRepository)
        {
            _productionUnitQueryRepository = productionUnitQueryRepository;            
        }

        public async Task<Response<GetProductionUnitByIdResponse>> Handle(GetProductionUnitByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetProductionUnitByIdValidator validator = new GetProductionUnitByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetProductionUnitByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _productionUnitQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetProductionUnitByIdResponse getObjectByIdResponse = new GetProductionUnitByIdResponse();
                    getObjectByIdResponse.ProductionUnit = getResult;
                    return new Response<GetProductionUnitByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetProductionUnitByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetProductionUnitByIdResponse>(ex);
            }
        }
    }
}
