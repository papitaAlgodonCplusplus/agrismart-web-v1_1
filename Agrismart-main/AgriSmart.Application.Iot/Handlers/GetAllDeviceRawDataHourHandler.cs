using AgriSmart.Application.Iot.Queries;
using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers.Queries
{
    public class GetAllDeviceRawDataHourHandler : IRequestHandler<GetAllDeviceRawDataHourQuery, Response<GetAllDeviceRawDataHourResponse>>
    {
        private readonly IDeviceRawDataHourQueryRepository _deviceRawDataHourQueryRepository;

        public GetAllDeviceRawDataHourHandler(IDeviceRawDataHourQueryRepository deviceRawDataHourQueryRepository)
        {
            _deviceRawDataHourQueryRepository = deviceRawDataHourQueryRepository;
        }

        public async Task<Response<GetAllDeviceRawDataHourResponse>> Handle(GetAllDeviceRawDataHourQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var data = await _deviceRawDataHourQueryRepository.GetAllAsync(
                    query.DeviceId,
                    query.StartDate,
                    query.EndDate,
                    query.Sensor,
                    query.PageNumber,
                    query.PageSize);

                var totalRecords = await _deviceRawDataHourQueryRepository.GetCountAsync(
                    query.DeviceId,
                    query.StartDate,
                    query.EndDate,
                    query.Sensor);

                var response = new GetAllDeviceRawDataHourResponse
                {
                    DeviceRawDataHour = data,
                    TotalRecords = totalRecords,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };

                return new Response<GetAllDeviceRawDataHourResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllDeviceRawDataHourResponse>(ex);
            }
        }
    }
}
