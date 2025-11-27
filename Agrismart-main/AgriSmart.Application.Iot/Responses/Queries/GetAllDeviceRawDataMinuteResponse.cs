using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public class GetAllDeviceRawDataMinuteResponse
    {
        public IReadOnlyList<DeviceRawDataMinute> DeviceRawDataMinute { get; set; } = new List<DeviceRawDataMinute>();
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
