using AgriSmart.Calculator.Entities;
using System.Reflection;

namespace AgriSmart.Calculator.Models
{
    public class IrrigationEvent
    {
        public long Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; }
        public DateTime DateTimeEnd { get; set; }

    }
}
