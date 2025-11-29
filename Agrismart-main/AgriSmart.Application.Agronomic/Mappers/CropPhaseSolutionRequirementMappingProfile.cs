using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropPhaseSolutionRequirementMappingProfile : AutoMapper.Profile
    {
        public CropPhaseSolutionRequirementMappingProfile() {
            CreateMap<CropPhaseSolutionRequirement, GetCropPhaseSolutionRequirementByIdPhaseResponse>().ReverseMap();
            CreateMap<CreateCropPhaseSolutionRequirementCommand, CropPhaseSolutionRequirement>().ReverseMap();
            CreateMap<UpdateCropPhaseSolutionRequirementCommand, CropPhaseSolutionRequirement>().ReverseMap();
            CreateMap<DeleteCropPhaseSolutionRequirementCommand, CropPhaseSolutionRequirement>().ReverseMap();
            CreateMap<CropPhaseSolutionRequirement, CreateCropPhaseSolutionRequirementResponse>().ReverseMap();
            CreateMap<CropPhaseSolutionRequirement, UpdateCropPhaseSolutionRequirementResponse>().ReverseMap();
            CreateMap<CropPhaseSolutionRequirement, DeleteCropPhaseSolutionRequirementResponse>().ReverseMap();
        }
    }
}
