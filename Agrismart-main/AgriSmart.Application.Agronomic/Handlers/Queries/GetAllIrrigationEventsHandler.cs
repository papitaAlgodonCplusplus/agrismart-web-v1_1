using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllIrrigationEventsHandler : IRequestHandler<GetAllIrrigationEventsQuery, Response<GetAllIrrigationEventsResponse>>
    {
        private readonly IIrrigationEventQueryRepository _iIrrigationEventQueryRepository;

        public GetAllIrrigationEventsHandler(IIrrigationEventQueryRepository iIrrigationEventQueryRepository)
        {
            _iIrrigationEventQueryRepository = iIrrigationEventQueryRepository;
        }

        public async Task<Response<GetAllIrrigationEventsResponse>> Handle(GetAllIrrigationEventsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllIrrigationEventsValidator validator = new GetAllIrrigationEventsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllIrrigationEventsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _iIrrigationEventQueryRepository.GetAllAsync(query.CropProductionId, query.StartingDateTime, query.EndingDateTime);

                if (getAllResult != null)
                {
                    GetAllIrrigationEventsResponse getAllIrrigationEventsResponse = new GetAllIrrigationEventsResponse();
                    getAllIrrigationEventsResponse.IrrigationEvents = getAllResult;
                    return new Response<GetAllIrrigationEventsResponse>(getAllIrrigationEventsResponse);
                }
                return new Response<GetAllIrrigationEventsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllIrrigationEventsResponse>(ex);
            }
        }
    }
}
