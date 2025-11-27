using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public class GetAggregatedDeviceRawDataResponse
    {
        public IReadOnlyList<AggregatedDeviceData> AggregatedData { get; set; }
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string AggregationInterval { get; set; }
        public string AggregationType { get; set; }
    }
}