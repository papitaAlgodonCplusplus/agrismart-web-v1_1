using System;
using System.Collections.Generic;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public class IrrigationPlanEntryScheduleDto
    {
        public int Id { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public TimeSpan StartTime { get; set; }
        public DateTime? ExecutionDate { get; set; }
        public int Duration { get; set; }
        public int? WStart { get; set; }
        public int? WEnd { get; set; }
        public int? Frequency { get; set; }
        public int Sequence { get; set; }
    }

    public class GetIrrigationPlanEntriesBySectorCompanyCropResponse
    {
        public List<IrrigationPlanEntryScheduleDto> IrrigationPlanEntries { get; set; } = new();
    }
}