

// Agrismart-main/AgriSmart.Calculator/Logic/ValidationEngine.cs
using AgriSmart.Calculator.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Logic
{
    public class ValidationEngine
    {
        private readonly ILogger<ValidationEngine> _logger;

        public ValidationEngine(ILogger<ValidationEngine> logger)
        {
            _logger = logger;
        }

        public async Task<SystemValidationResult> ValidateAsync(SystemValidationInput input)
        {
            _logger.LogInformation("Starting system validation");

            var result = new SystemValidationResult
            {
                Issues = new List<ValidationIssue>(),
                Recommendations = new List<string>()
            };

            try
            {
                // Perform various validations
                ValidatePressureParameters(input, result);
                ValidateFlowParameters(input, result);
                ValidateUniformityParameters(input, result);
                ValidateTechnicalCompliance(input, result);

                // Calculate overall score
                result.OverallScore = CalculateOverallScore(result);
                result.IsValid = result.OverallScore >= 70 && !HasCriticalIssues(result);

                _logger.LogInformation("System validation completed. Score: {Score}", result.OverallScore);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during system validation");
                result.IsValid = false;
                result.Issues.Add(new ValidationIssue
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "System Error",
                    Severity = "critical",
                    Message = ex.Message,
                    AffectedParameter = "System"
                });
                return result;
            }
        }

        private void ValidatePressureParameters(SystemValidationInput input, SystemValidationResult result)
        {
            var hydraulicResults = input.HydraulicResults;
            
            result.PressureValidation = new PressureValidation
            {
                MinPressure = hydraulicResults.StaticHead,
                MaxPressure = hydraulicResults.DynamicHead,
                PressureVariation = input.HydraulicParameters.PressureVariation,
                IsValid = hydraulicResults.TotalPressureLoss <= input.HydraulicParameters.OperatingPressure * 0.8
            };

            if (!result.PressureValidation.IsValid)
            {
                result.Issues.Add(new ValidationIssue
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Pressure",
                    Severity = "warning",
                    Message = "Pressure loss exceeds recommended limits",
                    AffectedParameter = "TotalPressureLoss",
                    CurrentValue = hydraulicResults.TotalPressureLoss,
                    RecommendedValue = input.HydraulicParameters.OperatingPressure * 0.8
                });
            }
        }

        private void ValidateFlowParameters(SystemValidationInput input, SystemValidationResult result)
        {
            var hydraulicResults = input.HydraulicResults;
            
            result.FlowValidation = new FlowValidation
            {
                FlowBalance = Math.Abs(hydraulicResults.SystemFlowRate - hydraulicResults.DesignFlowRate) / hydraulicResults.DesignFlowRate * 100,
                FlowVariation = 5.0, // Simplified
                AdequateFlow = hydraulicResults.SystemFlowRate >= hydraulicResults.DesignFlowRate * 0.9,
                IsValid = true
            };

            if (result.FlowValidation.FlowBalance > 10)
            {
                result.FlowValidation.IsValid = false;
                result.Issues.Add(new ValidationIssue
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Flow",
                    Severity = "warning",
                    Message = "Flow balance deviation exceeds acceptable limits",
                    AffectedParameter = "FlowBalance",
                    CurrentValue = result.FlowValidation.FlowBalance
                });
            }
        }

        private void ValidateUniformityParameters(SystemValidationInput input, SystemValidationResult result)
        {
            var hydraulicResults = input.HydraulicResults;
            var target = input.HydraulicParameters.TargetUniformity;
            
            result.UniformityValidation = new UniformityValidation
            {
                AchievedUniformity = hydraulicResults.DistributionUniformity,
                TargetUniformity = target,
                IsValid = hydraulicResults.DistributionUniformity >= target,
                UniformityGrade = GetUniformityGrade(hydraulicResults.DistributionUniformity)
            };

            if (!result.UniformityValidation.IsValid)
            {
                result.Issues.Add(new ValidationIssue
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Uniformity",
                    Severity = "warning",
                    Message = "Distribution uniformity below target",
                    AffectedParameter = "DistributionUniformity",
                    CurrentValue = hydraulicResults.DistributionUniformity,
                    RecommendedValue = target
                });
            }
        }

        private void ValidateTechnicalCompliance(SystemValidationInput input, SystemValidationResult result)
        {
            var hydraulicResults = input.HydraulicResults;
            
            result.TechnicalCompliance = new TechnicalCompliance
            {
                VelocityCompliance = hydraulicResults.AverageVelocity >= 0.3 && hydraulicResults.AverageVelocity <= 3.0,
                PressureCompliance = hydraulicResults.TotalPressureLoss <= input.HydraulicParameters.OperatingPressure,
                MaterialCompatibility = true, // Simplified
                StandardsCompliance = true // Simplified
            };
        }

        private string GetUniformityGrade(double uniformity)
        {
            return uniformity switch
            {
                >= 95 => "Excellent",
                >= 90 => "Good",
                >= 85 => "Fair",
                >= 80 => "Poor",
                _ => "Unacceptable"
            };
        }

        private double CalculateOverallScore(SystemValidationResult result)
        {
            var baseScore = 100.0;
            
            foreach (var issue in result.Issues)
            {
                baseScore -= issue.Severity switch
                {
                    "critical" => 25,
                    "warning" => 10,
                    "info" => 2,
                    _ => 0
                };
            }
            
            return Math.Max(0, baseScore);
        }

        private bool HasCriticalIssues(SystemValidationResult result)
        {
            return result.Issues.Any(i => i.Severity == "critical");
        }
    }
}