using AgriSmart.Application.Iot.Queries;
using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers.Queries
{
    public class GetAggregatedDeviceRawDataHandler : IRequestHandler<GetAggregatedDeviceRawDataQuery, Response<GetAggregatedDeviceRawDataResponse>>
    {
        private readonly IDeviceRawDataQueryRepository _deviceRawDataQueryRepository;

        public GetAggregatedDeviceRawDataHandler(IDeviceRawDataQueryRepository deviceRawDataQueryRepository)
        {
            _deviceRawDataQueryRepository = deviceRawDataQueryRepository;
        }

        public async Task<Response<GetAggregatedDeviceRawDataResponse>> Handle(GetAggregatedDeviceRawDataQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var data = await _deviceRawDataQueryRepository.GetAggregatedDataAsync(
                    query.DeviceId, 
                    query.StartDate, 
                    query.EndDate, 
                    query.Sensor,
                    query.AggregationInterval,
                    query.AggregationType,
                    query.PageNumber,
                    query.PageSize);

                var totalRecords = await _deviceRawDataQueryRepository.GetAggregatedCountAsync(
                    query.DeviceId, 
                    query.StartDate, 
                    query.EndDate, 
                    query.Sensor,
                    query.AggregationInterval);

                var response = new GetAggregatedDeviceRawDataResponse
                {
                    AggregatedData = data,
                    TotalRecords = totalRecords,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize,
                    AggregationInterval = query.AggregationInterval,
                    AggregationType = query.AggregationType
                };

                return new Response<GetAggregatedDeviceRawDataResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAggregatedDeviceRawDataResponse>(ex);
            }
        }
    }
}