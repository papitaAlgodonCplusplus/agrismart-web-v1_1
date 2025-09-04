using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class SensorMappingProfile : AutoMapper.Profile
    {
        public SensorMappingProfile()
        {
            CreateMap<Sensor, CreateSensorCommand>().ReverseMap();
            CreateMap<Sensor, CreateSensorResponse>().ReverseMap();
            CreateMap<Sensor, UpdateSensorCommand>().ReverseMap();
            CreateMap<Sensor, UpdateSensorResponse>().ReverseMap();
        }
    }
}
