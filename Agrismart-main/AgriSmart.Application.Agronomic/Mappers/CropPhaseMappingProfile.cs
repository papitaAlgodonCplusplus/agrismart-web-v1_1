using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropPhaseMappingProfile : AutoMapper.Profile
    {
        public CropPhaseMappingProfile() {
            CreateMap<CropPhase, CreateCropPhaseCommand>().ReverseMap();
            CreateMap<CropPhase, CreateCropPhaseResponse>().ReverseMap();
            CreateMap<CropPhase, UpdateCropPhaseCommand>().ReverseMap();
            CreateMap<CropPhase, UpdateCropPhaseResponse>().ReverseMap();
            CreateMap<DeleteCropPhaseCommand, CropPhase>();
        }
    }
}
