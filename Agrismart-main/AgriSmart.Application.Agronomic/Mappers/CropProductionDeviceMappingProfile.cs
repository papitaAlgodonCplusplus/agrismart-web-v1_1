using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropProductionDeviceMappingProfile : AutoMapper.Profile
    {
        public CropProductionDeviceMappingProfile() {

            CreateMap<CropProductionDevice, CreateCropProductionDeviceCommand>().ReverseMap();
            CreateMap<CropProductionDevice, CreateCropProductionDeviceResponse>().ReverseMap();
            CreateMap<CropProductionDevice, DeleteCropProductionDeviceCommand>().ReverseMap();
            CreateMap<CropProductionDevice, DeleteCropProductionDeviceResponse>().ReverseMap();
        }
    }
}
