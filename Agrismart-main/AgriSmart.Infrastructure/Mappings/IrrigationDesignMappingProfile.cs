
// Agrismart-main/AgriSmart.Infrastructure/Mappings/IrrigationDesignMappingProfile.cs (COMPLETE VERSION)
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using AgriSmart.Calculator.Entities;
using AutoMapper;
using System.Text.Json;
using System.Collections.Generic;

namespace AgriSmart.Infrastructure.Mappings
{
    public class IrrigationDesignMappingProfile : AutoMapper.Profile
    {
        public IrrigationDesignMappingProfile()
        {
            // Entity to DTO mappings
            CreateMap<IrrigationDesign, IrrigationDesignDto>()
                .ForMember(dest => dest.DesignParameters, opt => opt.MapFrom(src => 
                    JsonSerializer.Deserialize<IrrigationDesignParametersDto>(src.DesignParametersJson, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.HydraulicParameters, opt => opt.MapFrom(src => 
                    JsonSerializer.Deserialize<HydraulicParametersDto>(src.HydraulicParametersJson, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.OptimizationParameters, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.OptimizationParametersJson) ? null : 
                    JsonSerializer.Deserialize<OptimizationParametersDto>(src.OptimizationParametersJson, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.CalculationResults, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.CalculationResultsJson) ? null : 
                    JsonSerializer.Deserialize<IrrigationCalculationResultsDto>(src.CalculationResultsJson, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    JsonSerializer.Deserialize<List<string>>(src.TagsJson, (JsonSerializerOptions)null)));

            CreateMap<IrrigationTemplate, IrrigationTemplateDto>()
                .ForMember(dest => dest.DesignParameters, opt => opt.MapFrom(src => 
                    JsonSerializer.Deserialize<IrrigationDesignParametersDto>(src.DesignParametersJson, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.HydraulicParameters, opt => opt.MapFrom(src => 
                    JsonSerializer.Deserialize<HydraulicParametersDto>(src.HydraulicParametersJson, (JsonSerializerOptions)null)));

            // DTO to Entity mappings
            CreateMap<IrrigationDesignDto, IrrigationDesign>()
                .ForMember(dest => dest.DesignParametersJson, opt => opt.MapFrom(src => 
                    JsonSerializer.Serialize(src.DesignParameters, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.HydraulicParametersJson, opt => opt.MapFrom(src => 
                    JsonSerializer.Serialize(src.HydraulicParameters, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.OptimizationParametersJson, opt => opt.MapFrom(src => 
                    src.OptimizationParameters != null ? JsonSerializer.Serialize(src.OptimizationParameters, (JsonSerializerOptions)null) : null))
                .ForMember(dest => dest.CalculationResultsJson, opt => opt.MapFrom(src => 
                    src.CalculationResults != null ? JsonSerializer.Serialize(src.CalculationResults, (JsonSerializerOptions)null) : null))
                .ForMember(dest => dest.TagsJson, opt => opt.MapFrom(src => 
                    JsonSerializer.Serialize(src.Tags, (JsonSerializerOptions)null)));

            // DTO to Core Entity mappings
            CreateMap<IrrigationDesignParametersDto, IrrigationDesignParameters>();
            CreateMap<IrrigationDesignParameters, IrrigationDesignParametersDto>();
            
            CreateMap<HydraulicParametersDto, HydraulicParameters>();
            CreateMap<HydraulicParameters, HydraulicParametersDto>();
            
            CreateMap<OptimizationParametersDto, OptimizationParameters>();
            CreateMap<OptimizationParameters, OptimizationParametersDto>();
            
            CreateMap<EconomicParametersDto, EconomicParameters>();
            CreateMap<EconomicParameters, EconomicParametersDto>();

            // Calculation result mappings
            CreateMap<HydraulicCalculationResult, HydraulicCalculationResultDto>();
            CreateMap<HydraulicCalculationResultDto, HydraulicCalculationResult>();
            
            CreateMap<SystemValidationResult, SystemValidationResultDto>();
            CreateMap<SystemValidationResultDto, SystemValidationResult>();
            
            CreateMap<QuickCalculationResult, QuickCalculationResultDto>();
            CreateMap<QuickCalculationResultDto, QuickCalculationResult>();
            
            CreateMap<ParameterValidationResult, ParameterValidationResultDto>();
            CreateMap<ParameterValidationResultDto, ParameterValidationResult>();

            // Supporting class mappings
            CreateMap<ClimateParametersDto, ClimateParameters>();
            CreateMap<ClimateParameters, ClimateParametersDto>();
            
            CreateMap<WaterSourceDto, WaterSource>();
            CreateMap<WaterSource, WaterSourceDto>();
            
            CreateMap<WaterQualityDto, WaterQualityParameters>();
            CreateMap<WaterQualityParameters, WaterQualityDto>();
            
            CreateMap<PipelineConfigurationDto, PipelineConfiguration>();
            CreateMap<PipelineConfiguration, PipelineConfigurationDto>();
            
            CreateMap<SystemComponentsDto, SystemComponents>();
            CreateMap<SystemComponents, SystemComponentsDto>();

            CreateMap<WeightingFactorsDto, WeightingFactors>();
            CreateMap<WeightingFactors, WeightingFactorsDto>();
            
            CreateMap<ConstraintsDto, Constraints>();
            CreateMap<Constraints, ConstraintsDto>();

            // Validation mappings
            CreateMap<ValidationIssue, ValidationIssueDto>();
            CreateMap<ValidationIssueDto, ValidationIssue>();
            
            CreateMap<PressureValidation, PressureValidationDto>();
            CreateMap<PressureValidationDto, PressureValidation>();
            
            CreateMap<FlowValidation, FlowValidationDto>();
            CreateMap<FlowValidationDto, FlowValidation>();
            
            CreateMap<UniformityValidation, UniformityValidationDto>();
            CreateMap<UniformityValidationDto, UniformityValidation>();
            
            CreateMap<TechnicalCompliance, TechnicalComplianceDto>();
            CreateMap<TechnicalComplianceDto, TechnicalCompliance>();
            
            CreateMap<PerformancePrediction, PerformancePredictionDto>();
            CreateMap<PerformancePredictionDto, PerformancePrediction>();

            // Performance and reliability mappings
            CreateMap<EmitterPerformanceResult, EmitterPerformanceResultDto>();
            CreateMap<EmitterPerformanceResultDto, EmitterPerformanceResult>();
            
            CreateMap<SystemReliabilityResult, SystemReliabilityResultDto>();
            CreateMap<SystemReliabilityResultDto, SystemReliabilityResult>();
        }
    }
}
