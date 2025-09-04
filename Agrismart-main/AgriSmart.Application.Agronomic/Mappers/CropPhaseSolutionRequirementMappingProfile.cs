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
        }
    }
}
