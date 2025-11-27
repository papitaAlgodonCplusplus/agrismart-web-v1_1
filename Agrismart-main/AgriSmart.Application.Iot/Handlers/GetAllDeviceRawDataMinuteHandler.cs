using AgriSmart.Application.Iot.Queries;
using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers.Queries
{
    public class GetAllDeviceRawDataMinuteHandler : IRequestHandler<GetAllDeviceRawDataMinuteQuery, Response<GetAllDeviceRawDataMinuteResponse>>
    {
        private readonly IDeviceRawDataMinuteQueryRepository _deviceRawDataMinuteQueryRepository;

        public GetAllDeviceRawDataMinuteHandler(IDeviceRawDataMinuteQueryRepository deviceRawDataMinuteQueryRepository)
        {
            _deviceRawDataMinuteQueryRepository = deviceRawDataMinuteQueryRepository;
        }

        public async Task<Response<GetAllDeviceRawDataMinuteResponse>> Handle(GetAllDeviceRawDataMinuteQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var data = await _deviceRawDataMinuteQueryRepository.GetAllAsync(
                    query.DeviceId,
                    query.StartDate,
                    query.EndDate,
                    query.Sensor,
                    query.PageNumber,
                    query.PageSize);

                var totalRecords = await _deviceRawDataMinuteQueryRepository.GetCountAsync(
                    query.DeviceId,
                    query.StartDate,
                    query.EndDate,
                    query.Sensor);

                var response = new GetAllDeviceRawDataMinuteResponse
                {
                    DeviceRawDataMinute = data,
                    TotalRecords = totalRecords,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };

                return new Response<GetAllDeviceRawDataMinuteResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllDeviceRawDataMinuteResponse>(ex);
            }
        }
    }
}
