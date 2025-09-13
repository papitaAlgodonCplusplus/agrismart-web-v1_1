
using AgriSmart.Core.Entities;
using System.Threading.Tasks;
using AgriSmart.Calculator.Entities;

namespace AgriSmart.Core.Interfaces
{
    public interface IIrrigationDesignCalculator
    {
        Task<HydraulicCalculationResult> PerformHydraulicCalculationsAsync(HydraulicCalculationInput input);
        Task<QuickCalculationResult> PerformQuickCalculationsAsync(QuickCalculationInput input);
        Task<SystemValidationResult> PerformSystemValidationAsync(SystemValidationInput input);
        Task<ParameterValidationResult> ValidateDesignParametersAsync(IrrigationDesignParameters parameters);
    }
}
