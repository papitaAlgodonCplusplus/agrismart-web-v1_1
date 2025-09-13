

// Agrismart-main/AgriSmart.Calculator/Logic/EconomicAnalysisEngine.cs
using AgriSmart.Calculator.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Logic
{
    public class EconomicAnalysisEngine
    {
        private readonly ILogger<EconomicAnalysisEngine> _logger;

        public EconomicAnalysisEngine(ILogger<EconomicAnalysisEngine> logger)
        {
            _logger = logger;
        }

        public async Task<EconomicAnalysisResult> AnalyzeAsync(EconomicAnalysisInput input)
        {
            _logger.LogInformation("Starting economic analysis");

            var result = new EconomicAnalysisResult();

            try
            {
                // Calculate investment costs
                CalculateInvestmentCosts(input, result);
                
                // Calculate operating costs
                CalculateOperatingCosts(input, result);
                
                // Calculate financial metrics
                CalculateFinancialMetrics(input, result);

                _logger.LogInformation("Economic analysis completed. Total investment: {Investment:C}", 
                    result.TotalInvestment);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during economic analysis");
                result.ErrorMessage = ex.Message;
                return result;
            }
        }

        private void CalculateInvestmentCosts(EconomicAnalysisInput input, EconomicAnalysisResult result)
        {
            var designParams = input.DesignParameters;
            
            // Simplified cost calculations based on area and components
            var baseAreaCost = designParams.TotalArea * 150; // $150 per m²
            
            result.PipelineCost = baseAreaCost * 0.4;
            result.EmitterCost = baseAreaCost * 0.25;
            result.PumpingCost = baseAreaCost * 0.15;
            result.ControlCost = baseAreaCost * 0.1;
            result.InstallationCost = baseAreaCost * 0.1;
            
            result.TotalInvestment = result.PipelineCost + result.EmitterCost + 
                                   result.PumpingCost + result.ControlCost + result.InstallationCost;
        }

        private void CalculateOperatingCosts(EconomicAnalysisInput input, EconomicAnalysisResult result)
        {
            var totalInvestment = result.TotalInvestment;
            
            result.EnergyCost = totalInvestment * 0.05; // 5% of investment annually
            result.WaterCost = totalInvestment * 0.03; // 3% of investment annually
            result.MaintenanceCost = totalInvestment * 0.04; // 4% of investment annually
            result.LaborCost = totalInvestment * 0.02; // 2% of investment annually
            result.ReplacementCost = totalInvestment * 0.01; // 1% of investment annually
            
            result.AnnualOperatingCost = result.EnergyCost + result.WaterCost + 
                                       result.MaintenanceCost + result.LaborCost + result.ReplacementCost;
        }

        private void CalculateFinancialMetrics(EconomicAnalysisInput input, EconomicAnalysisResult result)
        {
            var economicParams = input.EconomicParameters;
            var annualBenefits = result.TotalInvestment * 0.18; // Assume 18% annual benefits
            var netAnnualBenefit = annualBenefits - result.AnnualOperatingCost;
            
            // Simplified financial calculations
            result.PaybackPeriod = result.TotalInvestment / netAnnualBenefit;
            result.ROI = (netAnnualBenefit / result.TotalInvestment) * 100;
            
            // NPV calculation (simplified)
            var discountRate = economicParams.DiscountRate / 100;
            var analysisHorizon = economicParams.AnalysisHorizon;
            
            result.NPV = 0;
            for (int year = 1; year <= analysisHorizon; year++)
            {
                result.NPV += netAnnualBenefit / Math.Pow(1 + discountRate, year);
            }
            result.NPV -= result.TotalInvestment;
            
            // IRR (simplified approximation)
            result.IRR = (netAnnualBenefit / result.TotalInvestment) * 100;
        }
    }
}
