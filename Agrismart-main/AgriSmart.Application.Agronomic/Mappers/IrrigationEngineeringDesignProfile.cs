// Agrismart-main/AgriSmart.Application.Agronomic/Mappings/IrrigationEngineeringDesignProfile.cs
using AutoMapper;
using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;

namespace AgriSmart.Application.Agronomic.Mappings
{
    public class IrrigationEngineeringDesignProfile : AutoMapper.Profile
    {
        public IrrigationEngineeringDesignProfile()
        {
            // =============================================================================
            // ENTITY TO DTO MAPPINGS
            // =============================================================================

            // Entity to List DTO (for GET collection operations)
            CreateMap<IrrigationEngineeringDesign, IrrigationEngineeringDesignDto>()
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : string.Empty))
                .ForMember(dest => dest.FarmName, opt => opt.MapFrom(src => src.Farm != null ? src.Farm.Name : null))
                .ForMember(dest => dest.CropProductionName, opt => opt.MapFrom(src => src.CropProduction != null ? src.CropProduction.Name : null))
                .ForMember(dest => dest.ContainerName, opt => opt.MapFrom(src => src.Container != null ? src.Container.Name : null))
                .ForMember(dest => dest.DropperName, opt => opt.MapFrom(src => src.Dropper != null ? src.Dropper.Name : null))
                .ForMember(dest => dest.GrowingMediumName, opt => opt.MapFrom(src => src.GrowingMedium != null ? src.GrowingMedium.Name : null))
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator != null ? src.Creator.UserEmail ?? "Unknown" : string.Empty));

            // Entity to Detail DTO (for GET single item operations)
            CreateMap<IrrigationEngineeringDesign, IrrigationEngineeringDesignDetailDto>()
                .IncludeBase<IrrigationEngineeringDesign, IrrigationEngineeringDesignDto>()
                .ForMember(dest => dest.UpdaterName, opt => opt.MapFrom(src => src.Updater != null ? src.Updater.UserEmail : null))
                .ForMember(dest => dest.ApproverName, opt => opt.MapFrom(src => src.Approver != null ? src.Approver.UserEmail : null));

            // =============================================================================
            // DTO TO COMMAND MAPPINGS
            // =============================================================================

            // Create DTO to Create Command
            CreateMap<CreateIrrigationEngineeringDesignDto, CreateIrrigationEngineeringDesignCommand>();

            // Update DTO to Update Command
            CreateMap<UpdateIrrigationEngineeringDesignDto, UpdateIrrigationEngineeringDesignCommand>();

            // Detail DTO to Update Command (for bulk operations)
            CreateMap<IrrigationEngineeringDesignDetailDto, UpdateIrrigationEngineeringDesignCommand>()
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore()); // Set separately in controller

            // =============================================================================
            // COMMAND TO ENTITY MAPPINGS
            // =============================================================================

            // Create Command to Entity
            CreateMap<CreateIrrigationEngineeringDesignCommand, IrrigationEngineeringDesign>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.RequiresRecalculation, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "draft"))
                .ForMember(dest => dest.Version, opt => opt.MapFrom(src => "1.0"))
                // Navigation properties - ignore, handled by EF
                .ForMember(dest => dest.Client, opt => opt.Ignore())
                .ForMember(dest => dest.Farm, opt => opt.Ignore())
                .ForMember(dest => dest.CropProduction, opt => opt.Ignore())
                .ForMember(dest => dest.Container, opt => opt.Ignore())
                .ForMember(dest => dest.Dropper, opt => opt.Ignore())
                .ForMember(dest => dest.GrowingMedium, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore())
                .ForMember(dest => dest.Updater, opt => opt.Ignore())
                .ForMember(dest => dest.Approver, opt => opt.Ignore());

            // Update Command to Entity (for partial updates)
            CreateMap<UpdateIrrigationEngineeringDesignCommand, IrrigationEngineeringDesign>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // Don't change ID
                .ForMember(dest => dest.ClientId, opt => opt.Ignore()) // Don't change client
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Don't change creation date
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // Don't change creator
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.RequiresRecalculation, opt => opt.MapFrom(src => true))
                // Navigation properties - ignore, handled by EF
                .ForMember(dest => dest.Client, opt => opt.Ignore())
                .ForMember(dest => dest.Farm, opt => opt.Ignore())
                .ForMember(dest => dest.CropProduction, opt => opt.Ignore())
                .ForMember(dest => dest.Container, opt => opt.Ignore())
                .ForMember(dest => dest.Dropper, opt => opt.Ignore())
                .ForMember(dest => dest.GrowingMedium, opt => opt.Ignore())
                .ForMember(dest => dest.Creator, opt => opt.Ignore())
                .ForMember(dest => dest.Updater, opt => opt.Ignore())
                .ForMember(dest => dest.Approver, opt => opt.Ignore());

            // =============================================================================
            // FILTER DTO TO QUERY MAPPINGS
            // =============================================================================

            CreateMap<IrrigationEngineeringDesignFilterDto, GetIrrigationEngineeringDesignsQuery>();

            // =============================================================================
            // VALUE CONVERTERS FOR SPECIAL CASES
            // =============================================================================

            // Convert comma-separated tags to list and vice versa
            CreateMap<string, List<string>>()
                .ConvertUsing(src => string.IsNullOrEmpty(src) 
                    ? new List<string>() 
                    : src.Split(',', StringSplitOptions.RemoveEmptyEntries)
                         .Select(s => s.Trim())
                         .ToList());

            CreateMap<List<string>, string>()
                .ConvertUsing(src => src != null && src.Any() 
                    ? string.Join(", ", src) 
                    : string.Empty);

            // =============================================================================
            // NESTED OBJECT MAPPINGS FOR JSON FIELDS
            // =============================================================================

            /*
            CreateMap<ComponentSpecification, string>()
                .ConvertUsing(src => JsonSerializer.Serialize(src));

            CreateMap<string, ComponentSpecification>()
                .ConvertUsing(src => string.IsNullOrEmpty(src) 
                    ? new ComponentSpecification() 
                    : JsonSerializer.Deserialize<ComponentSpecification>(src));
            */
        }
    }

    // =============================================================================
    // ADDITIONAL MAPPING PROFILES FOR RELATED ENTITIES
    // =============================================================================

    public class IrrigationDesignSummaryProfile : AutoMapper.Profile
    {
        public IrrigationDesignSummaryProfile()
        {
            // Mapping for summary statistics
            CreateMap<List<IrrigationEngineeringDesign>, IrrigationDesignSummaryDto>()
                .ForMember(dest => dest.TotalDesigns, opt => opt.MapFrom(src => src.Count))
                .ForMember(dest => dest.ActiveDesigns, opt => opt.MapFrom(src => src.Count(d => d.IsActive)))
                .ForMember(dest => dest.CompletedDesigns, opt => opt.MapFrom(src => src.Count(d => d.Status == "completed" || d.Status == "approved")))
                .ForMember(dest => dest.DesignsRequiringRecalculation, opt => opt.MapFrom(src => src.Count(d => d.RequiresRecalculation && d.IsActive)))
                .ForMember(dest => dest.TotalAreaDesigned, opt => opt.MapFrom(src => src.Where(d => d.IsActive).Sum(d => d.TotalArea)))
                .ForMember(dest => dest.AverageCostPerSquareMeter, opt => opt.MapFrom(src => 
                    src.Where(d => d.IsActive && d.TotalArea > 0 && d.TotalProjectCost > 0)
                       .Average(d => d.TotalProjectCost / d.TotalArea)))
                .ForMember(dest => dest.AverageEfficiency, opt => opt.MapFrom(src => 
                    src.Where(d => d.IsActive && d.ApplicationEfficiency > 0)
                       .Average(d => d.ApplicationEfficiency)))
                .ForMember(dest => dest.TotalProjectValue, opt => opt.MapFrom(src => 
                    src.Where(d => d.IsActive).Sum(d => d.TotalProjectCost)))
                .ForMember(dest => dest.DesignTypeStats, opt => opt.MapFrom(src => 
                    src.Where(d => d.IsActive)
                       .GroupBy(d => d.DesignType)
                       .Select(g => new DesignTypeStatDto
                       {
                           DesignType = g.Key,
                           Count = g.Count(),
                           TotalArea = g.Sum(d => d.TotalArea),
                           AverageCost = g.Where(d => d.TotalProjectCost > 0).Average(d => d.TotalProjectCost)
                       }).ToList()))
                .ForMember(dest => dest.MonthlyActivity, opt => opt.MapFrom(src => 
                    src.Where(d => d.IsActive)
                       .GroupBy(d => new { d.CreatedAt.Year, d.CreatedAt.Month })
                       .Select(g => new MonthlyDesignActivityDto
                       {
                           Year = g.Key.Year,
                           Month = g.Key.Month,
                           MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                           DesignsCreated = g.Count(),
                           DesignsCompleted = g.Count(d => d.Status == "completed" || d.Status == "approved"),
                           TotalAreaDesigned = g.Sum(d => d.TotalArea)
                       })
                       .OrderBy(m => m.Year)
                       .ThenBy(m => m.Month)
                       .ToList()));
        }
    }

    // =============================================================================
    // CALCULATION RESULT MAPPINGS
    // =============================================================================

    public class IrrigationCalculationProfile : AutoMapper.Profile
    {
        public IrrigationCalculationProfile()
        {
            // Mapping for calculation requests
            CreateMap<IrrigationDesignCalculationRequestDto, CalculateIrrigationEngineeringDesignCommand>()
                .ForMember(dest => dest.RequestedBy, opt => opt.Ignore()); // Set in controller

            // Mapping for calculation results (if you have a calculation result entity)
            /*
            CreateMap<IrrigationCalculationResult, IrrigationDesignCalculationResultDto>()
                .ForMember(dest => dest.Success, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Errors)))
                .ForMember(dest => dest.CalculatedAt, opt => opt.MapFrom(src => src.CompletedAt));
            */
        }
    }
}