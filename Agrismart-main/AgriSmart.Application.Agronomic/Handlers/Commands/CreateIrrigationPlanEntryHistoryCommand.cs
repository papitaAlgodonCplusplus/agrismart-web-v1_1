
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Commands
{
    public class CreateIrrigationPlanEntryHistoryCommand : IRequest<Response<CreateIrrigationPlanEntryHistoryResponse>>
    {
        public int IrrigationPlanEntryId { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public DateTime ExecutionStartTime { get; set; }
        public DateTime? ExecutionEndTime { get; set; }
        public int PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }
        public string ExecutionStatus { get; set; } = "Scheduled";
        public int? Sequence { get; set; }
        public string? Notes { get; set; }
        public string? ErrorMessage { get; set; }
        public bool IsManualExecution { get; set; } = true;
        public decimal? WaterVolumeDelivered { get; set; }
        public decimal? FlowRate { get; set; }
        public decimal? Pressure { get; set; }
        public decimal? Temperature { get; set; }
        public string? DeviceId { get; set; }
        public int CreatedBy { get; set; }
    }

    public class CreateIrrigationPlanEntryHistoryResponse
    {
        public int Id { get; set; }
        public int IrrigationPlanEntryId { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public DateTime ExecutionStartTime { get; set; }
        public string ExecutionStatus { get; set; }
        public int PlannedDuration { get; set; }
    }
}
