
// Agrismart-main/AgriSmart.Application.Agronomic/Commands/
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CalculateIrrigationEngineeringDesignCommand : IRequest<IrrigationDesignCalculationResultDto>
    {
        public int DesignId { get; set; }
        public bool RecalculateHydraulics { get; set; } = true;
        public bool RecalculateEconomics { get; set; } = true;
        public bool RecalculatePerformance { get; set; } = true;
        public bool RunOptimization { get; set; } = false;
        public string? CalculationNotes { get; set; }
        public int RequestedBy { get; set; }
    }
}
