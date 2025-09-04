using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllIrrigationRequestsHandler : IRequestHandler<GetAllIrrigationRequestsQuery, Response<GetAllIrrigationRequestsResponse>>
    {
        private readonly IIrrigationRequestsQueryRepository _irrigationRequestsQueryRepository;

        public GetAllIrrigationRequestsHandler(IIrrigationRequestsQueryRepository irrigationRequestsQueryRepository)
        {
            _irrigationRequestsQueryRepository = irrigationRequestsQueryRepository;
        }

        public async Task<Response<GetAllIrrigationRequestsResponse>> Handle(GetAllIrrigationRequestsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllIrrigationRequestsValidator validator = new GetAllIrrigationRequestsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllIrrigationRequestsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _irrigationRequestsQueryRepository.GetAllAsync(query.ClientId, query.CompanyId, query.FarmId, query.ProductionUnitId);

                if (getAllResult != null)
                {
                    GetAllIrrigationRequestsResponse getAllIrrigationRequestsResponse = new GetAllIrrigationRequestsResponse();
                    getAllIrrigationRequestsResponse.IrrigationRequests = getAllResult;
                    return new Response<GetAllIrrigationRequestsResponse>(getAllIrrigationRequestsResponse);
                }
                return new Response<GetAllIrrigationRequestsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllIrrigationRequestsResponse>(ex);
            }
        }
    }
}
