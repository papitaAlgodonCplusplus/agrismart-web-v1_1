using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class WaterMappingProfile : AutoMapper.Profile
    {
        public WaterMappingProfile()
        {
            CreateMap<Water, CreateWaterCommand>().ReverseMap();
            CreateMap<Water, CreateWaterResponse>().ReverseMap();
            CreateMap<Water, UpdateWaterCommand>().ReverseMap();
            CreateMap<Water, UpdateWaterResponse>().ReverseMap();
        }
    }
}
