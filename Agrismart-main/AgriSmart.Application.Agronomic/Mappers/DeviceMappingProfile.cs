using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class DeviceMappingProfile : AutoMapper.Profile
    {
        public DeviceMappingProfile()
        {
            CreateMap<Device, CreateDeviceCommand>().ReverseMap();
            CreateMap<Device, CreateDeviceResponse>().ReverseMap();
            CreateMap<Device, UpdateDeviceCommand>().ReverseMap();
            CreateMap<Device, UpdateDeviceResponse>().ReverseMap();
            CreateMap<DeleteDeviceCommand, Device>();
        }
    }
}
