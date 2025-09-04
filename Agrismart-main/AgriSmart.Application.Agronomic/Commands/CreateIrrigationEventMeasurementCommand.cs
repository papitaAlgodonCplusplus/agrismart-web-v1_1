using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateIrrigationEventMeasurementCommand
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int MeasurementVariableId { get; set; }
        public double RecordValue { get; set; }

    }
}
