using AgriSmart.Application.Iot.Queries;
using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers.Queries
{
    public class GetAllDeviceRawDataHandler : IRequestHandler<GetAllDeviceRawDataQuery, Response<GetAllDeviceRawDataResponse>>
    {
        private readonly IDeviceRawDataQueryRepository _deviceRawDataQueryRepository;

        public GetAllDeviceRawDataHandler(IDeviceRawDataQueryRepository deviceRawDataQueryRepository)
        {
            _deviceRawDataQueryRepository = deviceRawDataQueryRepository;
        }

        public async Task<Response<GetAllDeviceRawDataResponse>> Handle(GetAllDeviceRawDataQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var data = await _deviceRawDataQueryRepository.GetAllAsync(
                    query.DeviceId, 
                    query.StartDate, 
                    query.EndDate, 
                    query.Sensor,
                    query.PageNumber,
                    query.PageSize);

                var totalRecords = await _deviceRawDataQueryRepository.GetCountAsync(
                    query.DeviceId, 
                    query.StartDate, 
                    query.EndDate, 
                    query.Sensor);

                var response = new GetAllDeviceRawDataResponse
                {
                    DeviceRawData = data,
                    TotalRecords = totalRecords,
                    PageNumber = query.PageNumber,
                    PageSize = query.PageSize
                };

                return new Response<GetAllDeviceRawDataResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllDeviceRawDataResponse>(ex);
            }
        }
    }
}