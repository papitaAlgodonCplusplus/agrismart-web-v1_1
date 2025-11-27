using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Queries
{
    public class GetAllDeviceRawDataHourQuery : IRequest<Response<GetAllDeviceRawDataHourResponse>>
    {
        public string? DeviceId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Sensor { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 100000;
    }
}
