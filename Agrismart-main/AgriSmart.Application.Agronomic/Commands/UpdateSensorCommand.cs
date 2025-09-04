using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateSensorCommand : IRequest<Response<UpdateSensorResponse>>
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers { get; set; }
        public bool Active { get; set; }
    }
}
