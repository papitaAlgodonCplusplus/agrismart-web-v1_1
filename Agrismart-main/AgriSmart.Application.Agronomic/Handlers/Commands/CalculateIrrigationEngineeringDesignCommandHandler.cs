// =============================================================================
// CALCULATION COMMAND HANDLER
// =============================================================================

// Agrismart-main/AgriSmart.Application.Agronomic/Handlers/Commands/CalculateIrrigationEngineeringDesignCommandHandler.cs
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.DTOs;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Calculator.Interfaces;
using AgriSmart.Calculator.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CalculateIrrigationEngineeringDesignCommandHandler : IRequestHandler<CalculateIrrigationEngineeringDesignCommand, IrrigationDesignCalculationResultDto>
    {
        private readonly AgriSmartContext _context;
        private readonly IIrrigationDesignCalculator _calculator;
        private readonly ILogger<CalculateIrrigationEngineeringDesignCommandHandler> _logger;

        public CalculateIrrigationEngineeringDesignCommandHandler(
            AgriSmartContext context,
            IIrrigationDesignCalculator calculator,
            ILogger<CalculateIrrigationEngineeringDesignCommandHandler> logger)
        {
            _context = context;
            _calculator = calculator;
            _logger = logger;
        }

        public async Task<IrrigationDesignCalculationResultDto> Handle(CalculateIrrigationEngineeringDesignCommand request, CancellationToken cancellationToken)
        {
            var result = new IrrigationDesignCalculationResultDto
            {
                DesignId = request.DesignId,
                CalculatedAt = DateTime.UtcNow,
                Success = false
            };

            try
            {
                // Get the design
                var design = await _context.IrrigationEngineeringDesigns
                    .Include(d => d.Container)
                    .Include(d => d.Dropper)
                    .Include(d => d.GrowingMedium)
                    .FirstOrDefaultAsync(d => d.Id == request.DesignId && d.IsActive, cancellationToken);

                if (design == null)
                {
                    result.Errors = $"Design with ID {request.DesignId} not found or inactive";
                    return result;
                }

                // Mark calculation as in progress
                design.CalculationInProgress = true;
                design.CalculationErrors = null;
                await _context.SaveChangesAsync(cancellationToken);

                var errors = new List<string>();
                var warnings = new List<string>();

                // =============================================================================
                // HYDRAULIC CALCULATIONS
                // =============================================================================

                if (request.RecalculateHydraulics)
                {
                    try
                    {
                        _logger.LogInformation("Starting hydraulic calculations for design {DesignId}", request.DesignId);

                        var hydraulicParams = new IrrigationDesignParameters
                        {
                            TotalArea = (double)design.TotalArea,
                            NumberOfSectors = design.NumberOfSectors,
                            ContainerDensity = (double)design.ContainerDensity,
                            PlantDensity = (double)design.PlantDensity,
                            DailyWaterRequirement = (double)design.DailyWaterRequirement,
                            IrrigationFrequency = (double)design.IrrigationFrequency,
                            ContainerId = design.ContainerId ?? 0,
                            DropperId = design.DropperId ?? 0,
                            GrowingMediumId = design.GrowingMediumId ?? 0,
                            Climate = new ClimateParameters
                            {
                                AverageTemperature = (double)design.AverageTemperature,
                                AverageHumidity = (double)design.AverageHumidity,
                                WindSpeed = (double)design.WindSpeed,
                                SolarRadiation = (double)design.SolarRadiation,
                                Elevation = (double)design.Elevation
                            },
                            WaterSource = new WaterSource
                            {
                                SourceType = design.WaterSourceType,
                                WaterPressure = (double)design.WaterPressure,
                                WaterFlow = (double)design.WaterFlowRate,
                                WaterQuality = new WaterQualityParameters
                                {
                                    Ph = (double)design.WaterPh,
                                    ElectricalConductivity = (double)design.ElectricalConductivity,
                                    TotalDissolvedSolids = (double)design.TotalDissolvedSolids,
                                    Nitrates = (double)design.Nitrates,
                                    Phosphorus = (double)design.Phosphorus,
                                    Potassium = (double)design.Potassium
                                }
                            },
                            PipelineConfiguration = new PipelineConfiguration
                            {
                                MainPipeDiameter = (double)design.MainPipeDiameter,
                                SecondaryPipeDiameter = (double)design.SecondaryPipeDiameter,
                                LateralPipeDiameter = (double)design.LateralPipeDiameter,
                                MainPipeLength = (double)design.MainPipeLength,
                                SecondaryPipeLength = (double)design.SecondaryPipeLength,
                                LateralPipeLength = (double)design.LateralPipeLength
                            },
                            SystemComponents = new SystemComponents
                            {
                                HasFiltration = design.HasFiltration,
                                HasAutomation = design.HasAutomation,
                                HasFertigation = design.HasFertigation,
                                HasFlowMeter = design.HasFlowMeter,
                                HasPressureRegulator = design.HasPressureRegulator
                            },
                            DesignType = design.DesignType,
                            MainPipeDiameter = (double)design.MainPipeDiameter,
                            SecondaryPipeDiameter = (double)design.SecondaryPipeDiameter,
                            LateralPipeDiameter = (double)design.LateralPipeDiameter,
                            HasFiltration = design.HasFiltration,
                            HasAutomation = design.HasAutomation,
                            WaterQuality = new WaterQualityParameters
                            {
                                Ph = (double)design.WaterPh,
                                ElectricalConductivity = (double)design.ElectricalConductivity,
                                TotalDissolvedSolids = (double)design.TotalDissolvedSolids
                            }
                        };

                        var hydraulicResults = await _calculator.CalculateHydraulicParametersAsync(hydraulicParams);

                        // Update design with hydraulic results
                        design.TotalSystemFlowRate = (decimal)hydraulicResults.TotalFlowRate;
                        design.SystemPressureLoss = (decimal)hydraulicResults.PressureLoss;
                        design.RequiredPumpPower = (decimal)hydraulicResults.RequiredPower;
                        design.MaxFlowVelocity = (decimal)hydraulicResults.MaxVelocity;
                        design.UniformityCoefficient = (decimal)hydraulicResults.UniformityCoefficient;
                        design.EmitterFlowRate = (decimal)hydraulicResults.EmitterFlowRate;
                        design.WorkingPressure = (decimal)hydraulicResults.WorkingPressure;

                        // Validate hydraulic results
                        design.IsHydraulicallyValid = hydraulicResults.IsValid;
                        if (!hydraulicResults.IsValid && !string.IsNullOrEmpty(hydraulicResults.ValidationMessage))
                        {
                            warnings.Add($"Hydraulic validation: {hydraulicResults.ValidationMessage}");
                        }

                        result.TotalSystemFlowRate = (decimal)hydraulicResults.TotalFlowRate;
                        result.SystemPressureLoss = (decimal)hydraulicResults.PressureLoss;
                        result.RequiredPumpPower = (decimal)hydraulicResults.RequiredPower;
                        result.UniformityCoefficient = (decimal)hydraulicResults.UniformityCoefficient;
                        result.IsHydraulicallyValid = hydraulicResults.IsValid;

                        _logger.LogInformation("Completed hydraulic calculations for design {DesignId}", request.DesignId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in hydraulic calculations for design {DesignId}", request.DesignId);
                        errors.Add($"Hydraulic calculation error: {ex.Message}");
                    }
                }

                // =============================================================================
                // ECONOMIC CALCULATIONS
                // =============================================================================

                if (request.RecalculateEconomics)
                {
                    try
                    {
                        _logger.LogInformation("Starting economic calculations for design {DesignId}", request.DesignId);

                        var economicParams = new EconomicAnalysisParameters
                        {
                            TotalArea = (double)design.TotalArea,
                            SystemType = design.DesignType,
                            ComponentCount = design.NumberOfSectors,
                            HasFiltration = design.HasFiltration,
                            HasAutomation = design.HasAutomation,
                            HasFertigation = design.HasFertigation,
                            PipelineLengths = new Dictionary<string, double>
                            {
                                ["Main"] = (double)design.MainPipeLength,
                                ["Secondary"] = (double)design.SecondaryPipeLength,
                                ["Lateral"] = (double)design.LateralPipeLength
                            },
                            PipelineMaterials = new Dictionary<string, string>
                            {
                                ["Main"] = design.MainPipeMaterial,
                                ["Secondary"] = design.SecondaryPipeMaterial,
                                ["Lateral"] = design.LateralPipeMaterial
                            },
                            RequiredPumpPower = (double)design.RequiredPumpPower,
                            OperatingHoursPerDay = (double)design.IrrigationFrequency * 2, // Estimate
                            OperatingDaysPerYear = 300 // Estimate
                        };

                        var economicResults = await _calculator.CalculateEconomicAnalysisAsync(economicParams);

                        // Update design with economic results
                        design.TotalMaterialCost = (decimal)economicResults.MaterialCost;
                        design.InstallationCost = (decimal)economicResults.InstallationCost;
                        design.TotalProjectCost = (decimal)economicResults.TotalProjectCost;
                        design.CostPerSquareMeter = design.TotalArea > 0 ? design.TotalProjectCost / design.TotalArea : 0;
                        design.MaintenanceCostPerYear = (decimal)economicResults.AnnualMaintenanceCost;
                        design.EnergyConsumptionPerYear = (decimal)economicResults.AnnualEnergyConsumption;
                        design.PaybackPeriod = (decimal)economicResults.PaybackPeriod;

                        // Validate economic viability
                        design.IsEconomicallyViable = economicResults.IsViable;
                        if (!economicResults.IsViable && !string.IsNullOrEmpty(economicResults.ValidationMessage))
                        {
                            warnings.Add($"Economic validation: {economicResults.ValidationMessage}");
                        }

                        result.TotalProjectCost = (decimal)economicResults.TotalProjectCost;
                        result.CostPerSquareMeter = design.CostPerSquareMeter;
                        result.PaybackPeriod = (decimal)economicResults.PaybackPeriod;
                        result.IsEconomicallyViable = economicResults.IsViable;

                        _logger.LogInformation("Completed economic calculations for design {DesignId}", request.DesignId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in economic calculations for design {DesignId}", request.DesignId);
                        errors.Add($"Economic calculation error: {ex.Message}");
                    }
                }

                // =============================================================================
                // PERFORMANCE CALCULATIONS
                // =============================================================================

                if (request.RecalculatePerformance)
                {
                    try
                    {
                        _logger.LogInformation("Starting performance calculations for design {DesignId}", request.DesignId);

                        var performanceParams = new PerformanceAnalysisParameters
                        {
                            DesignType = design.DesignType,
                            TotalArea = (double)design.TotalArea,
                            WaterApplicationRate = (double)design.DailyWaterRequirement,
                            UniformityCoefficient = (double)design.UniformityCoefficient,
                            SoilType = design.SoilType,
                            ClimateConditions = new ClimateParameters
                            {
                                AverageTemperature = (double)design.AverageTemperature,
                                AverageHumidity = (double)design.AverageHumidity,
                                WindSpeed = (double)design.WindSpeed
                            },
                            SoilParameters = new SoilParameters
                            {
                                WaterHoldingCapacity = (double)design.SoilWaterHoldingCapacity,
                                InfiltrationRate = (double)design.SoilInfiltrationRate,
                                SlopePercentage = (double)design.SlopePercentage
                            }
                        };

                        var performanceResults = await _calculator.CalculatePerformanceMetricsAsync(performanceParams);

                        // Update design with performance results
                        design.ApplicationEfficiency = (decimal)performanceResults.ApplicationEfficiency;
                        design.DistributionUniformity = (decimal)performanceResults.DistributionUniformity;
                        design.WaterUseEfficiency = (decimal)performanceResults.WaterUseEfficiency;
                        design.SustainabilityScore = (decimal)performanceResults.SustainabilityScore;
                        design.WaterSavingsPercentage = (decimal)performanceResults.WaterSavingsPercentage;
                        design.EnergySavingsPercentage = (decimal)performanceResults.EnergySavingsPercentage;

                        // Environmental assessment
                        design.IsEnvironmentallySound = performanceResults.IsEnvironmentallySound;
                        design.MeetsAgronomicRequirements = performanceResults.MeetsAgronomicRequirements;

                        result.ApplicationEfficiency = (decimal)performanceResults.ApplicationEfficiency;
                        result.WaterUseEfficiency = (decimal)performanceResults.WaterUseEfficiency;
                        result.SustainabilityScore = (decimal)performanceResults.SustainabilityScore;
                        result.IsEnvironmentallySound = performanceResults.IsEnvironmentallySound;
                        result.MeetsAgronomicRequirements = performanceResults.MeetsAgronomicRequirements;

                        _logger.LogInformation("Completed performance calculations for design {DesignId}", request.DesignId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in performance calculations for design {DesignId}", request.DesignId);
                        errors.Add($"Performance calculation error: {ex.Message}");
                    }
                }

                // =============================================================================
                // OPTIMIZATION (OPTIONAL)
                // =============================================================================

                if (request.RunOptimization)
                {
                    try
                    {
                        _logger.LogInformation("Starting optimization for design {DesignId}", request.DesignId);

                        var optimizationParams = new OptimizationParameters
                        {
                            CurrentDesign = new IrrigationDesignParameters
                            {
                                TotalArea = (double)design.TotalArea,
                                DailyWaterRequirement = (double)design.DailyWaterRequirement
                            },
                            OptimizationCriteria = new List<string> { "cost", "efficiency", "sustainability" },
                            Constraints = new Dictionary<string, object>
                            {
                                ["MaxCost"] = design.TotalProjectCost * 1.2m, // Allow 20% increase
                                ["MinEfficiency"] = 85.0, // Minimum 85% efficiency
                                ["MaxPressure"] = 3.0 // Maximum 3 bar pressure
                            }
                        };

                        var optimizationResults = await _calculator.OptimizeDesignAsync(optimizationParams);

                        if (optimizationResults.HasImprovements)
                        {
                            var recommendations = new List<string>();
                            
                            foreach (var improvement in optimizationResults.Recommendations)
                            {
                                recommendations.Add($"{improvement.Parameter}: {improvement.CurrentValue} → {improvement.RecommendedValue} ({improvement.ImprovementPercentage:F1}% improvement)");
                            }

                            design.RecommendationsAndOptimizations = string.Join("; ", recommendations);
                            result.RecommendationsAndOptimizations = design.RecommendationsAndOptimizations;
                        }

                        _logger.LogInformation("Completed optimization for design {DesignId}", request.DesignId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in optimization for design {DesignId}", request.DesignId);
                        warnings.Add($"Optimization warning: {ex.Message}");
                    }
                }

                // =============================================================================
                // FINALIZE CALCULATION
                // =============================================================================

                // Update calculation metadata
                design.LastCalculatedAt = DateTime.UtcNow;
                design.RequiresRecalculation = false;
                design.CalculationInProgress = false;
                design.CalculationNotes = request.CalculationNotes;
                
                if (errors.Any())
                {
                    design.CalculationErrors = string.Join("; ", errors);
                    result.Errors = string.Join("; ", errors);
                }
                else
                {
                    design.CalculationErrors = null;
                    result.Success = true;
                }

                if (warnings.Any())
                {
                    result.Warnings = string.Join("; ", warnings);
                }

                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Calculation completed for design {DesignId}. Success: {Success}", 
                    request.DesignId, result.Success);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during calculation for design {DesignId}", request.DesignId);
                
                // Reset calculation flags
                var design = await _context.IrrigationEngineeringDesigns
                    .FirstOrDefaultAsync(d => d.Id == request.DesignId, cancellationToken);
                
                if (design != null)
                {
                    design.CalculationInProgress = false;
                    design.CalculationErrors = ex.Message;
                    await _context.SaveChangesAsync(cancellationToken);
                }

                result.Errors = $"Unexpected calculation error: {ex.Message}";
                return result;
            }
        }
    }
}

// =============================================================================
// SUMMARY QUERY HANDLER
// =============================================================================
