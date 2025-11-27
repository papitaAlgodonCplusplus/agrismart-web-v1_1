using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public class GetAllDeviceRawDataHourResponse
    {
        public IReadOnlyList<DeviceRawDataHour> DeviceRawDataHour { get; set; } = new List<DeviceRawDataHour>();
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
