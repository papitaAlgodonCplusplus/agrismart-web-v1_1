using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public class GetAllDeviceRawDataResponse
    {
        public IReadOnlyList<DeviceRawData> DeviceRawData { get; set; } = new List<DeviceRawData>();
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}