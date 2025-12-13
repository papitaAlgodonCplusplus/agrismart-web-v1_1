using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Queries
{
    public class GetAllDeviceRawDataQuery : IRequest<Response<GetAllDeviceRawDataResponse>>
    {
        public string? DeviceId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Sensor { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 1000; // Reduced from 100,000 to 1,000 for better performance
    }
}