using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Queries
{
    public class GetAggregatedDeviceRawDataQuery : IRequest<Response<GetAggregatedDeviceRawDataResponse>>
    {
        public string? DeviceId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Sensor { get; set; }
        
        /// <summary>
        /// Aggregation interval: "minute", "hour", "day", "week", "month"
        /// </summary>
        public string AggregationInterval { get; set; } = "hour";
        
        /// <summary>
        /// Aggregation type: "avg", "min", "max", "sum", "count"
        /// </summary>
        public string AggregationType { get; set; } = "avg";
        
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 1000;
    }
}