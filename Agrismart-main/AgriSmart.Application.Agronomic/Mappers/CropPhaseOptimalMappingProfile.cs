using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropPhaseOptimalMappingProfile : AutoMapper.Profile
    {
        public CropPhaseOptimalMappingProfile() {
            CreateMap<CropPhaseOptimal, CreateCropPhaseOptimalCommand>().ReverseMap();
            CreateMap<CropPhaseOptimal, CreateCropPhaseOptimalResponse>().ReverseMap();
            CreateMap<CropPhaseOptimal, UpdateCropPhaseOptimalCommand>().ReverseMap();
            CreateMap<CropPhaseOptimal, UpdateCropPhaseOptimalResponse>().ReverseMap();
        }
    }
}
