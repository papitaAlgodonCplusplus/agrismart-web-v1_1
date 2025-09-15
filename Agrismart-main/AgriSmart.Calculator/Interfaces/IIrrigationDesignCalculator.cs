using AgriSmart.Calculator.Entities;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Interfaces
{
    public interface IIrrigationDesignCalculator
    {
        Task<HydraulicCalculationResult> CalculateHydraulicParametersAsync(IrrigationDesignParameters parameters);
        Task<EconomicAnalysisResult> CalculateEconomicAnalysisAsync(EconomicAnalysisParameters parameters);
        Task<PerformanceMetricsResult> CalculatePerformanceMetricsAsync(PerformanceAnalysisParameters parameters);
        Task<OptimizationResult> OptimizeDesignAsync(OptimizationParameters parameters);
        Task<ValidationResult> ValidateDesignAsync(IrrigationDesignParameters parameters);
        Task<HydraulicCalculationResult> PerformHydraulicCalculationsAsync(HydraulicCalculationInput input);
        Task<QuickCalculationResult> PerformQuickCalculationsAsync(QuickCalculationInput input);
        Task<SystemValidationResult> PerformSystemValidationAsync(SystemValidationInput input);
        Task<ParameterValidationResult> ValidateDesignParametersAsync(IrrigationDesignParameters parameters);
    }
}