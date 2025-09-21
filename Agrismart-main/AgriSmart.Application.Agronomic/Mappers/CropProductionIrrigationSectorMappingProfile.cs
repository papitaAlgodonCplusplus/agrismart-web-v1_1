using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropProductionIrrigationSectorMappingProfile : AutoMapper.Profile
    {
        public CropProductionIrrigationSectorMappingProfile() {
            CreateMap<CropProductionIrrigationSector, CreateCropProductionIrrigationSectorCommand>().ReverseMap();
            CreateMap<CropProductionIrrigationSector, CreateCropProductionIrrigationSectorResponse>().ReverseMap();
            CreateMap<CropProductionIrrigationSector, UpdateCropProductionIrrigationSectorCommand>().ReverseMap();
            CreateMap<CropProductionIrrigationSector, UpdateCropProductionIrrigationSectorResponse>().ReverseMap();
            CreateMap<DeleteCropProductionIrrigationSectorCommand, CropProductionIrrigationSector>();
        }
    }
}
