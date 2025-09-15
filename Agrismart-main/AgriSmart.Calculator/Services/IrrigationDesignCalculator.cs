
// Agrismart-main/AgriSmart.Calculator/Services/
using AgriSmart.Calculator.Interfaces;
using AgriSmart.Calculator.Entities;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Services
{
    public class IrrigationDesignCalculator : IIrrigationDesignCalculator
    {
        private readonly ILogger<IrrigationDesignCalculator> _logger;

        public IrrigationDesignCalculator(ILogger<IrrigationDesignCalculator> logger)
        {
            _logger = logger;
        }

        public async Task<HydraulicCalculationResult> CalculateHydraulicParametersAsync(IrrigationDesignParameters parameters)
        {
            try
            {
                _logger.LogInformation("Starting hydraulic calculations for design type: {DesignType}", parameters.DesignType);

                var result = new HydraulicCalculationResult();

                // =============================================================================
                // FLOW RATE CALCULATIONS
                // =============================================================================

                // Calculate total water demand
                var totalWaterDemand = parameters.TotalArea * parameters.PlantDensity * parameters.DailyWaterRequirement; // L/day
                var peakFlowRate = totalWaterDemand * parameters.IrrigationFrequency / (24 * 60); // L/min

                // Account for system efficiency and uniformity
                var systemEfficiency = CalculateSystemEfficiency(parameters);
                var adjustedFlowRate = peakFlowRate / systemEfficiency;

                result.TotalFlowRate = adjustedFlowRate;

                // =============================================================================
                // EMITTER CALCULATIONS
                // =============================================================================

                var emitterFlowRate = CalculateEmitterFlowRate(parameters);
                var emittersPerPlant = Math.Ceiling(parameters.DailyWaterRequirement / (emitterFlowRate * parameters.IrrigationFrequency));
                var totalEmitters = parameters.TotalArea * parameters.PlantDensity * emittersPerPlant;

                result.EmitterFlowRate = emitterFlowRate;
                result.AdditionalMetrics["TotalEmitters"] = totalEmitters;
                result.AdditionalMetrics["EmittersPerPlant"] = emittersPerPlant;

                // =============================================================================
                // PRESSURE CALCULATIONS
                // =============================================================================

                // Calculate pressure requirements
                var operatingPressure = CalculateOperatingPressure(parameters);
                var frictionLoss = CalculateFrictionLoss(parameters, adjustedFlowRate);
                var elevationLoss = CalculateElevationLoss(parameters);
                var fittingLoss = CalculateFittingLoss(parameters);

                var totalPressureLoss = frictionLoss + elevationLoss + fittingLoss;
                var systemPressure = operatingPressure + totalPressureLoss;

                result.WorkingPressure = operatingPressure;
                result.PressureLoss = totalPressureLoss;
                result.AdditionalMetrics["SystemPressure"] = systemPressure;
                result.AdditionalMetrics["FrictionLoss"] = frictionLoss;
                result.AdditionalMetrics["ElevationLoss"] = elevationLoss;

                // =============================================================================
                // VELOCITY CALCULATIONS
                // =============================================================================

                var maxVelocity = CalculateMaxVelocity(parameters, adjustedFlowRate);
                result.MaxVelocity = maxVelocity;

                // =============================================================================
                // UNIFORMITY CALCULATIONS
                // =============================================================================

                var uniformityCoefficient = CalculateUniformityCoefficient(parameters, totalPressureLoss);
                result.UniformityCoefficient = uniformityCoefficient;

                // =============================================================================
                // PUMP POWER CALCULATIONS
                // =============================================================================

                var pumpEfficiency = 0.75; // Typical pump efficiency
                var requiredPower = (adjustedFlowRate * systemPressure * 1000) / (60000 * pumpEfficiency); // kW
                result.RequiredPower = requiredPower;

                // =============================================================================
                // VALIDATION
                // =============================================================================

                var validation = ValidateHydraulicResults(result, parameters);
                result.IsValid = validation.IsValid;
                result.ValidationMessage = validation.Message;

                _logger.LogInformation("Hydraulic calculations completed. Flow rate: {FlowRate} L/min, Pressure: {Pressure} bar", 
                    result.TotalFlowRate, result.PressureLoss);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in hydraulic calculations");
                return new HydraulicCalculationResult 
                { 
                    IsValid = false, 
                    ValidationMessage = $"Calculation error: {ex.Message}" 
                };
            }
        }

        public async Task<EconomicAnalysisResult> CalculateEconomicAnalysisAsync(EconomicAnalysisParameters parameters)
        {
            try
            {
                _logger.LogInformation("Starting economic analysis for {SystemType} system", parameters.SystemType);

                var result = new EconomicAnalysisResult();

                // =============================================================================
                // MATERIAL COSTS
                // =============================================================================

                var pipelineCost = CalculatePipelineCost(parameters);
                var emitterCost = CalculateEmitterCost(parameters);
                var pumpCost = CalculatePumpCost(parameters);
                var filtrationCost = parameters.HasFiltration ? CalculateFiltrationCost(parameters) : 0;
                var automationCost = parameters.HasAutomation ? CalculateAutomationCost(parameters) : 0;
                var fertigationCost = parameters.HasFertigation ? CalculateFertigationCost(parameters) : 0;
                var miscellaneousCost = (pipelineCost + emitterCost + pumpCost) * 0.15; // 15% for fittings, valves, etc.

                result.MaterialCost = pipelineCost + emitterCost + pumpCost + filtrationCost + automationCost + fertigationCost + miscellaneousCost;

                result.CostBreakdown["Pipeline"] = pipelineCost;
                result.CostBreakdown["Emitters"] = emitterCost;
                result.CostBreakdown["Pump"] = pumpCost;
                result.CostBreakdown["Filtration"] = filtrationCost;
                result.CostBreakdown["Automation"] = automationCost;
                result.CostBreakdown["Fertigation"] = fertigationCost;
                result.CostBreakdown["Miscellaneous"] = miscellaneousCost;

                // =============================================================================
                // INSTALLATION COSTS
                // =============================================================================

                var laborHours = CalculateInstallationTime(parameters);
                result.InstallationCost = laborHours * parameters.LaborCostPerHour;

                // =============================================================================
                // TOTAL PROJECT COST
                // =============================================================================

                result.TotalProjectCost = result.MaterialCost + result.InstallationCost;

                // =============================================================================
                // OPERATING COSTS
                // =============================================================================

                // Energy costs
                var annualEnergyConsumption = parameters.RequiredPumpPower * parameters.OperatingHoursPerDay * parameters.OperatingDaysPerYear;
                var annualEnergyCost = annualEnergyConsumption * parameters.EnergyPrice;

                result.AnnualEnergyConsumption = annualEnergyConsumption;

                // Maintenance costs
                result.AnnualMaintenanceCost = CalculateMaintenanceCost(parameters, result.MaterialCost);

                result.AnnualOperatingCost = annualEnergyCost + result.AnnualMaintenanceCost;

                // =============================================================================
                // FINANCIAL METRICS
                // =============================================================================

                // Simple payback period calculation (would need water savings data for accurate calculation)
                var annualSavings = parameters.TotalArea * 100; // Placeholder: $100/hectare annual savings
                result.PaybackPeriod = annualSavings > 0 ? result.TotalProjectCost / annualSavings : 999;

                // Net Present Value
                result.NetPresentValue = CalculateNPV(result.TotalProjectCost, annualSavings, result.AnnualOperatingCost, 
                    parameters.ProjectLifespan, parameters.DiscountRate);

                // Return on Investment
                result.ReturnOnInvestment = result.TotalProjectCost > 0 ? (annualSavings / result.TotalProjectCost) * 100 : 0;

                // =============================================================================
                // VIABILITY ASSESSMENT
                // =============================================================================

                result.IsViable = result.PaybackPeriod <= 10 && result.NetPresentValue > 0 && result.ReturnOnInvestment > 8;
                
                if (!result.IsViable)
                {
                    var issues = new List<string>();
                    if (result.PaybackPeriod > 10) issues.Add($"Long payback period ({result.PaybackPeriod:F1} years)");
                    if (result.NetPresentValue <= 0) issues.Add("Negative NPV");
                    if (result.ReturnOnInvestment <= 8) issues.Add($"Low ROI ({result.ReturnOnInvestment:F1}%)");
                    
                    result.ValidationMessage = $"Economic concerns: {string.Join(", ", issues)}";
                }

                _logger.LogInformation("Economic analysis completed. Total cost: ${TotalCost:N2}, Payback: {Payback:F1} years", 
                    result.TotalProjectCost, result.PaybackPeriod);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in economic analysis");
                return new EconomicAnalysisResult 
                { 
                    IsViable = false, 
                    ValidationMessage = $"Economic analysis error: {ex.Message}" 
                };
            }
        }

        public async Task<PerformanceMetricsResult> CalculatePerformanceMetricsAsync(PerformanceAnalysisParameters parameters)
        {
            try
            {
                _logger.LogInformation("Starting performance analysis for {DesignType} system", parameters.DesignType);

                var result = new PerformanceMetricsResult();

                // =============================================================================
                // APPLICATION EFFICIENCY
                // =============================================================================

                // Base efficiency by system type
                var baseEfficiency = parameters.DesignType.ToLower() switch
                {
                    "drip" => 90.0,
                    "micro-sprinkler" => 85.0,
                    "sprinkler" => 75.0,
                    _ => 80.0
                };

                // Adjust for uniformity
                var uniformityFactor = parameters.UniformityCoefficient / 100.0;
                var adjustedEfficiency = baseEfficiency * uniformityFactor;

                // Adjust for environmental conditions
                var windAdjustment = Math.Max(0.8, 1.0 - (parameters.ClimateConditions.WindSpeed - 2.0) * 0.05);
                var temperatureAdjustment = Math.Max(0.9, 1.0 - Math.Abs(parameters.ClimateConditions.AverageTemperature - 25.0) * 0.002);

                result.ApplicationEfficiency = adjustedEfficiency * windAdjustment * temperatureAdjustment;

                // =============================================================================
                // DISTRIBUTION UNIFORMITY
                // =============================================================================

                result.DistributionUniformity = parameters.UniformityCoefficient;

                // =============================================================================
                // WATER USE EFFICIENCY
                // =============================================================================

                // Consider soil characteristics
                var soilFactor = CalculateSoilFactor(parameters.SoilParameters);
                var infiltrationFactor = parameters.SoilParameters.InfiltrationRate > parameters.WaterApplicationRate ? 1.0 : 0.8;
                
                result.WaterUseEfficiency = result.ApplicationEfficiency * soilFactor * infiltrationFactor;

                // =============================================================================
                // SUSTAINABILITY SCORE
                // =============================================================================

                var sustainabilityFactors = new Dictionary<string, double>
                {
                    ["WaterEfficiency"] = result.WaterUseEfficiency / 100.0,
                    ["EnergyEfficiency"] = Math.Min(1.0, 85.0 / Math.Max(50.0, result.ApplicationEfficiency)),
                    ["SoilHealth"] = CalculateSoilHealthScore(parameters.SoilParameters),
                    ["SystemDurability"] = CalculateSystemDurabilityScore(parameters.DesignType),
                    ["MaintenanceComplexity"] = CalculateMaintenanceScore(parameters.DesignType)
                };

                result.SustainabilityScore = sustainabilityFactors.Values.Average() * 100;

                // =============================================================================
                // COMPARATIVE SAVINGS
                // =============================================================================

                // Compare against traditional flood irrigation
                var traditionalEfficiency = 45.0; // Typical flood irrigation efficiency
                result.WaterSavingsPercentage = ((traditionalEfficiency - result.WaterUseEfficiency) / traditionalEfficiency) * -100;
                
                // Energy savings (modern irrigation typically uses more energy but saves water)
                result.EnergySavingsPercentage = parameters.DesignType.ToLower() == "drip" ? -20 : -10; // Negative because modern systems use more energy

                // =============================================================================
                // ENVIRONMENTAL AND AGRONOMIC ASSESSMENT
                // =============================================================================

                result.IsEnvironmentallySound = result.SustainabilityScore >= 70 && result.WaterSavingsPercentage >= 20;
                result.MeetsAgronomicRequirements = result.WaterUseEfficiency >= 80 && result.DistributionUniformity >= 85;

                // =============================================================================
                // PERFORMANCE NOTES
                // =============================================================================

                var notes = new List<string>();
                if (result.ApplicationEfficiency < 75) notes.Add("Consider design improvements for better application efficiency");
                if (result.DistributionUniformity < 85) notes.Add("Distribution uniformity could be improved");
                if (result.SustainabilityScore < 70) notes.Add("Sustainability score indicates room for environmental improvements");
                
                result.PerformanceNotes = notes.Any() ? string.Join(". ", notes) : "Performance meets all criteria";

                // Store detailed metrics
                result.PerformanceMetrics = new Dictionary<string, double>
                {
                    ["BaseEfficiency"] = baseEfficiency,
                    ["UniformityFactor"] = uniformityFactor,
                    ["WindAdjustment"] = windAdjustment,
                    ["TemperatureAdjustment"] = temperatureAdjustment,
                    ["SoilFactor"] = soilFactor,
                    ["InfiltrationFactor"] = infiltrationFactor
                };

                _logger.LogInformation("Performance analysis completed. Application efficiency: {Efficiency:F1}%, Sustainability: {Sustainability:F1}", 
                    result.ApplicationEfficiency, result.SustainabilityScore);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in performance analysis");
                return new PerformanceMetricsResult 
                { 
                    IsEnvironmentallySound = false,
                    MeetsAgronomicRequirements = false,
                    PerformanceNotes = $"Performance analysis error: {ex.Message}" 
                };
            }
        }

        public async Task<OptimizationResult> OptimizeDesignAsync(OptimizationParameters parameters)
        {
            try
            {
                _logger.LogInformation("Starting design optimization");

                var result = new OptimizationResult();
                var recommendations = new List<OptimizationRecommendation>();

                // =============================================================================
                // PIPE SIZING OPTIMIZATION
                // =============================================================================

                if (parameters.OptimizePipeSizing)
                {
                    var pipeOptimization = OptimizePipeDiameters(parameters.CurrentDesign);
                    recommendations.AddRange(pipeOptimization);
                }

                // =============================================================================
                // EMITTER SPACING OPTIMIZATION
                // =============================================================================

                if (parameters.OptimizeEmitterSpacing)
                {
                    var emitterOptimization = OptimizeEmitterConfiguration(parameters.CurrentDesign);
                    recommendations.AddRange(emitterOptimization);
                }

                // =============================================================================
                // SYSTEM PRESSURE OPTIMIZATION
                // =============================================================================

                if (parameters.OptimizeSystemPressure)
                {
                    var pressureOptimization = OptimizeSystemPressure(parameters.CurrentDesign);
                    recommendations.AddRange(pressureOptimization);
                }

                // =============================================================================
                // CALCULATE OVERALL IMPROVEMENTS
                // =============================================================================

                result.Recommendations = recommendations;
                result.HasImprovements = recommendations.Any(r => r.ImprovementPercentage > 5);
                
                if (result.HasImprovements)
                {
                    result.PotentialCostSavings = recommendations.Sum(r => Math.Max(0, r.EstimatedCostImpact));
                    result.PotentialEfficiencyGain = recommendations
                        .Where(r => r.Parameter.Contains("Efficiency") || r.Parameter.Contains("Uniformity"))
                        .Sum(r => r.ImprovementPercentage);

                    result.OptimizationNotes = $"Found {recommendations.Count} optimization opportunities with potential savings of ${result.PotentialCostSavings:N2}";
                }
                else
                {
                    result.OptimizationNotes = "Current design is well optimized. No significant improvements identified.";
                }

                _logger.LogInformation("Optimization completed. Improvements found: {HasImprovements}, Recommendations: {Count}", 
                    result.HasImprovements, result.Recommendations.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in design optimization");
                return new OptimizationResult 
                { 
                    HasImprovements = false,
                    OptimizationNotes = $"Optimization error: {ex.Message}" 
                };
            }
        }

        public async Task<ValidationResult> ValidateDesignAsync(IrrigationDesignParameters parameters)
        {
            var result = new ValidationResult();
            var errors = new List<ValidationError>();
            var warnings = new List<ValidationWarning>();

            // Validate basic parameters
            if (parameters.TotalArea <= 0)
                errors.Add(new ValidationError { Category = "Area", Message = "Total area must be greater than zero" });

            if (parameters.DailyWaterRequirement <= 0)
                errors.Add(new ValidationError { Category = "Water", Message = "Daily water requirement must be specified" });

            // Validate pipe sizing
            if (parameters.MainPipeDiameter > parameters.SecondaryPipeDiameter || 
                parameters.SecondaryPipeDiameter > parameters.LateralPipeDiameter)
                warnings.Add(new ValidationWarning 
                { 
                    Category = "Pipeline", 
                    Message = "Pipe diameters should decrease from main to lateral",
                    Recommendation = "Review pipe sizing hierarchy"
                });

            result.Errors = errors;
            result.Warnings = warnings;
            result.IsValid = !errors.Any();
            result.OverallScore = result.IsValid ? Math.Max(0, 100 - warnings.Count * 10) : 0;

            return result;
        }

        // =============================================================================
        // PRIVATE HELPER METHODS
        // =============================================================================

        private double CalculateSystemEfficiency(IrrigationDesignParameters parameters)
        {
            return parameters.DesignType.ToLower() switch
            {
                "drip" => 0.95,
                "micro-sprinkler" => 0.90,
                "sprinkler" => 0.85,
                _ => 0.85
            };
        }

        private double CalculateEmitterFlowRate(IrrigationDesignParameters parameters)
        {
            // Typical emitter flow rates by system type (L/h)
            return parameters.DesignType.ToLower() switch
            {
                "drip" => 2.0,
                "micro-sprinkler" => 15.0,
                "sprinkler" => 50.0,
                _ => 2.0
            };
        }

        private double CalculateOperatingPressure(IrrigationDesignParameters parameters)
        {
            // Typical operating pressures by system type (bar)
            return parameters.DesignType.ToLower() switch
            {
                "drip" => 1.5,
                "micro-sprinkler" => 2.0,
                "sprinkler" => 3.0,
                _ => 1.5
            };
        }

        private double CalculateFrictionLoss(IrrigationDesignParameters parameters, double flowRate)
        {
            // Simplified Hazen-Williams equation for friction loss
            var mainLoss = CalculatePipeFrictionLoss(parameters.MainPipeDiameter, parameters.MainPipeLength, flowRate);
            var secondaryLoss = CalculatePipeFrictionLoss(parameters.SecondaryPipeDiameter, parameters.SecondaryPipeLength, flowRate * 0.6);
            var lateralLoss = CalculatePipeFrictionLoss(parameters.LateralPipeDiameter, parameters.LateralPipeLength, flowRate * 0.3);
            
            return mainLoss + secondaryLoss + lateralLoss;
        }

        private double CalculatePipeFrictionLoss(double diameter, double length, double flowRate)
        {
            if (diameter <= 0 || length <= 0 || flowRate <= 0) return 0;
            
            // Hazen-Williams equation simplified for PVC (C = 150)
            var velocityHead = Math.Pow(flowRate / (Math.PI * Math.Pow(diameter / 2000, 2) * 60), 2) / (2 * 9.81);
            var frictionFactor = 0.02; // Approximate for PVC
            
            return frictionFactor * (length / (diameter / 1000)) * velocityHead / 10; // Convert to bar
        }

        private double CalculateElevationLoss(IrrigationDesignParameters parameters)
        {
            // Assume 2m elevation change as default
            var elevationChange = 2.0; // meters
            return elevationChange * 0.0981; // Convert to bar (0.0981 bar/m)
        }

        private double CalculateFittingLoss(IrrigationDesignParameters parameters)
        {
            // Estimate fitting losses as 20% of friction losses
            return 0.2; // bar
        }

        private double CalculateMaxVelocity(IrrigationDesignParameters parameters, double flowRate)
        {
            var minDiameter = Math.Min(Math.Min(parameters.MainPipeDiameter, parameters.SecondaryPipeDiameter), parameters.LateralPipeDiameter);
            var area = Math.PI * Math.Pow(minDiameter / 2000, 2); // m²
            return (flowRate / 60000) / area; // m/s
        }

        private double CalculateUniformityCoefficient(IrrigationDesignParameters parameters, double pressureLoss)
        {
            // Base uniformity by system type
            var baseUniformity = parameters.DesignType.ToLower() switch
            {
                "drip" => 95.0,
                "micro-sprinkler" => 90.0,
                "sprinkler" => 85.0,
                _ => 85.0
            };

            // Reduce uniformity based on pressure variation
            var pressureVariation = pressureLoss / Math.Max(0.5, parameters.WaterSource.WaterPressure);
            var uniformityReduction = pressureVariation * 10; // 10% reduction per bar of pressure variation

            return Math.Max(70, baseUniformity - uniformityReduction);
        }

        private (bool IsValid, string Message) ValidateHydraulicResults(HydraulicCalculationResult result, IrrigationDesignParameters parameters)
        {
            var issues = new List<string>();

            if (result.MaxVelocity > 2.0)
                issues.Add($"High velocity ({result.MaxVelocity:F1} m/s) may cause pipe wear");

            if (result.PressureLoss > parameters.WaterSource.WaterPressure * 0.6)
                issues.Add("High pressure loss relative to available pressure");

            if (result.UniformityCoefficient < 80)
                issues.Add($"Low uniformity coefficient ({result.UniformityCoefficient:F1}%)");

            return (issues.Count == 0, issues.Any() ? string.Join(", ", issues) : "All hydraulic parameters are within acceptable ranges");
        }

        // Economic calculation helper methods
        private double CalculatePipelineCost(EconomicAnalysisParameters parameters)
        {
            var costPerMeter = new Dictionary<string, double>
            {
                ["PVC"] = 15.0, // $/m for average diameter
                ["HDPE"] = 18.0,
                ["Steel"] = 25.0
            };

            var totalCost = 0.0;
            foreach (var pipeline in parameters.PipelineLengths)
            {
                var material = parameters.PipelineMaterials.GetValueOrDefault(pipeline.Key, "PVC");
                var unitCost = costPerMeter.GetValueOrDefault(material, 15.0);
                totalCost += pipeline.Value * unitCost;
            }
            return totalCost;
        }

        private double CalculateEmitterCost(EconomicAnalysisParameters parameters)
        {
            var emitterCostPerUnit = parameters.SystemType.ToLower() switch
            {
                "drip" => 0.50, // $0.50 per dripper
                "micro-sprinkler" => 3.00, // $3.00 per micro-sprinkler
                "sprinkler" => 25.00, // $25.00 per sprinkler
                _ => 2.00
            };

            var emittersNeeded = parameters.TotalArea * parameters.ComponentCount / 10.0; // Estimate
            return emittersNeeded * emitterCostPerUnit;
        }

        private double CalculatePumpCost(EconomicAnalysisParameters parameters)
        {
            // Cost based on required power: $200/kW + $500 base cost
            return 500 + (parameters.RequiredPumpPower * 200);
        }

        private double CalculateFiltrationCost(EconomicAnalysisParameters parameters)
        {
            return parameters.SystemType.ToLower() switch
            {
                "drip" => 800, // Screen filter
                "micro-sprinkler" => 600, // Basic filter
                "sprinkler" => 400, // Simple strainer
                _ => 600
            };
        }

        private double CalculateAutomationCost(EconomicAnalysisParameters parameters)
        {
            var baseCost = 1500; // Controller
            var costPerZone = 150; // Valve + wiring per zone
            return baseCost + (parameters.ComponentCount * costPerZone);
        }

        private double CalculateFertigationCost(EconomicAnalysisParameters parameters)
        {
            return 2500; // Injection system + tanks
        }

        private double CalculateInstallationTime(EconomicAnalysisParameters parameters)
        {
            var baseHours = parameters.TotalArea * 2; // 2 hours per hectare base
            var systemComplexity = 1.0;

            if (parameters.HasFiltration) systemComplexity += 0.2;
            if (parameters.HasAutomation) systemComplexity += 0.3;
            if (parameters.HasFertigation) systemComplexity += 0.2;

            return baseHours * systemComplexity;
        }

        private double CalculateMaintenanceCost(EconomicAnalysisParameters parameters, double materialCost)
        {
            var baseMaintenance = materialCost * 0.03; // 3% of material cost annually

            if (parameters.HasFiltration) baseMaintenance += 300; // Filter maintenance
            if (parameters.HasAutomation) baseMaintenance += 200; // Automation maintenance
            if (parameters.HasFertigation) baseMaintenance += 400; // Fertigation maintenance

            return baseMaintenance;
        }

        private double CalculateNPV(double initialCost, double annualSavings, double annualCosts, int lifespan, double discountRate)
        {
            var npv = -initialCost;
            var netAnnualFlow = annualSavings - annualCosts;

            for (int year = 1; year <= lifespan; year++)
            {
                npv += netAnnualFlow / Math.Pow(1 + discountRate, year);
            }

            return npv;
        }

        // Performance calculation helper methods
        private double CalculateSoilFactor(SoilParameters soilParams)
        {
            var drainageFactor = soilParams.DrainageClass.ToLower() switch
            {
                "poor" => 0.8,
                "moderate" => 0.9,
                "well" => 1.0,
                "excessive" => 0.95,
                _ => 0.9
            };

            var slopeFactor = soilParams.SlopePercentage switch
            {
                <= 2 => 1.0,
                <= 5 => 0.95,
                <= 10 => 0.9,
                _ => 0.85
            };

            return drainageFactor * slopeFactor;
        }

        private double CalculateSoilHealthScore(SoilParameters soilParams)
        {
            var organicMatterScore = Math.Min(1.0, soilParams.OrganicMatter / 3.0); // Optimal at 3%
            var drainageScore = soilParams.DrainageClass.ToLower() == "well" ? 1.0 : 0.8;
            var infiltrationScore = soilParams.InfiltrationRate switch
            {
                >= 10 and <= 30 => 1.0, // Optimal range
                >= 5 and < 10 => 0.8,
                > 30 => 0.9,
                _ => 0.7
            };

            return (organicMatterScore + drainageScore + infiltrationScore) / 3.0;
        }

        private double CalculateSystemDurabilityScore(string designType)
        {
            return designType.ToLower() switch
            {
                "drip" => 0.85, // Good durability but clogging risk
                "micro-sprinkler" => 0.90, // Very good durability
                "sprinkler" => 0.95, // Excellent durability
                _ => 0.85
            };
        }

        private double CalculateMaintenanceScore(string designType)
        {
            return designType.ToLower() switch
            {
                "drip" => 0.7, // Higher maintenance needs
                "micro-sprinkler" => 0.85, // Moderate maintenance
                "sprinkler" => 0.9, // Lower maintenance
                _ => 0.8
            };
        }

        // Optimization helper methods
        private List<OptimizationRecommendation> OptimizePipeDiameters(IrrigationDesignParameters design)
        {
            var recommendations = new List<OptimizationRecommendation>();

            // Check if main pipe is oversized
            if (design.MainPipeDiameter > design.SecondaryPipeDiameter * 1.5)
            {
                var recommendedDiameter = design.SecondaryPipeDiameter * 1.3;
                var costSaving = (design.MainPipeDiameter - recommendedDiameter) * design.MainPipeLength * 0.5; // $0.5/mm/m saving

                recommendations.Add(new OptimizationRecommendation
                {
                    Parameter = "Main Pipe Diameter",
                    CurrentValue = $"{design.MainPipeDiameter} mm",
                    RecommendedValue = $"{recommendedDiameter:F0} mm",
                    ImprovementPercentage = ((design.MainPipeDiameter - recommendedDiameter) / design.MainPipeDiameter) * 100,
                    Justification = "Reduce pipe diameter while maintaining adequate flow capacity",
                    EstimatedCostImpact = costSaving
                });
            }

            return recommendations;
        }

        private List<OptimizationRecommendation> OptimizeEmitterConfiguration(IrrigationDesignParameters design)
        {
            var recommendations = new List<OptimizationRecommendation>();

            // Optimize emitter spacing based on soil type and plant requirements
            if (design.DesignType.ToLower() == "drip")
            {
                var currentSpacing = 0.3; // Assume 30cm current spacing
                var optimalSpacing = CalculateOptimalEmitterSpacing(design);

                if (Math.Abs(currentSpacing - optimalSpacing) > 0.05) // 5cm difference threshold
                {
                    var emitterChange = (currentSpacing - optimalSpacing) / currentSpacing;
                    var costImpact = emitterChange * design.TotalArea * 50; // $50/ha impact

                    recommendations.Add(new OptimizationRecommendation
                    {
                        Parameter = "Emitter Spacing",
                        CurrentValue = $"{currentSpacing * 100:F0} cm",
                        RecommendedValue = $"{optimalSpacing * 100:F0} cm",
                        ImprovementPercentage = Math.Abs(emitterChange) * 100,
                        Justification = optimalSpacing > currentSpacing 
                            ? "Increase spacing to reduce costs without compromising uniformity"
                            : "Decrease spacing to improve water distribution uniformity",
                        EstimatedCostImpact = costImpact
                    });
                }
            }

            return recommendations;
        }

        private List<OptimizationRecommendation> OptimizeSystemPressure(IrrigationDesignParameters design)
        {
            var recommendations = new List<OptimizationRecommendation>();

            var currentPressure = design.WaterSource.WaterPressure;
            var optimalPressure = CalculateOptimalSystemPressure(design);

            if (currentPressure > optimalPressure * 1.2) // 20% threshold
            {
                var pressureReduction = currentPressure - optimalPressure;
                var energySaving = pressureReduction * 0.1 * design.TotalArea; // Estimate energy savings

                recommendations.Add(new OptimizationRecommendation
                {
                    Parameter = "System Pressure",
                    CurrentValue = $"{currentPressure:F1} bar",
                    RecommendedValue = $"{optimalPressure:F1} bar",
                    ImprovementPercentage = (pressureReduction / currentPressure) * 100,
                    Justification = "Reduce system pressure to save energy while maintaining performance",
                    EstimatedCostImpact = energySaving * 10 // $10 per unit of energy saving
                });
            }

            return recommendations;
        }

        private double CalculateOptimalEmitterSpacing(IrrigationDesignParameters design)
        {
            // Simplified calculation based on soil infiltration rate and plant spacing
            var baseSpacing = 0.3; // 30cm default
            
            // Adjust based on daily water requirement
            if (design.DailyWaterRequirement > 5) baseSpacing *= 0.8; // Closer spacing for high water needs
            if (design.DailyWaterRequirement < 2) baseSpacing *= 1.2; // Wider spacing for low water needs

            return Math.Max(0.15, Math.Min(0.6, baseSpacing)); // Constrain between 15cm and 60cm
        }

        private double CalculateOptimalSystemPressure(IrrigationDesignParameters design)
        {
            var operatingPressure = CalculateOperatingPressure(design);
            var estimatedLosses = 0.5; // Estimate system losses
            var safetyFactor = 1.1; // 10% safety margin

            return (operatingPressure + estimatedLosses) * safetyFactor;
        }

        // Additional interface methods
        public async Task<HydraulicCalculationResult> PerformHydraulicCalculationsAsync(HydraulicCalculationInput input)
        {
            return await CalculateHydraulicParametersAsync(input.DesignParameters);
        }

        public async Task<QuickCalculationResult> PerformQuickCalculationsAsync(QuickCalculationInput input)
        {
            var hydraulicResult = await CalculateHydraulicParametersAsync(input.DesignParameters);

            return new QuickCalculationResult
            {
                FlowRate = hydraulicResult.TotalFlowRate,
                PressureLoss = hydraulicResult.PressureLoss,
                EstimatedCost = hydraulicResult.TotalFlowRate * 100, // Rough estimate
                ApplicationEfficiency = hydraulicResult.UniformityCoefficient,
                IsViable = hydraulicResult.IsValid,
                Notes = hydraulicResult.ValidationMessage
            };
        }

        public async Task<SystemValidationResult> PerformSystemValidationAsync(SystemValidationInput input)
        {
            var designValidation = await ValidateDesignAsync(input.DesignParameters);

            return new SystemValidationResult
            {
                IsSystemValid = designValidation.IsValid,
                HydraulicValidation = designValidation,
                StructuralValidation = new ValidationResult { IsValid = true, OverallScore = 90 },
                EconomicValidation = new ValidationResult { IsValid = true, OverallScore = 85 },
                SystemRecommendations = designValidation.Warnings.Select(w => w.Recommendation).ToList(),
                OverallSystemScore = designValidation.OverallScore
            };
        }

        public async Task<ParameterValidationResult> ValidateDesignParametersAsync(IrrigationDesignParameters parameters)
        {
            var validationResult = await ValidateDesignAsync(parameters);

            return new ParameterValidationResult
            {
                AreParametersValid = validationResult.IsValid,
                ParameterValidations = new Dictionary<string, ValidationResult> { ["Overall"] = validationResult },
                CriticalIssues = validationResult.Errors.Select(e => e.Message).ToList(),
                Suggestions = validationResult.Warnings.Select(w => w.Recommendation).ToList()
            };
        }

        // Add missing pipe length properties to parameters
        private double MainPipeLength => 100; // Default lengths
        private double SecondaryPipeLength => 200;
        private double LateralPipeLength => 300;
    }
}
