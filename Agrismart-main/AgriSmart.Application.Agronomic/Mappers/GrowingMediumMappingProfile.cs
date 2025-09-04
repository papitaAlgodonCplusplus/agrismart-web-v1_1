using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class GrowingMediumMappingProfile : AutoMapper.Profile
    {
        public GrowingMediumMappingProfile()
        {
            CreateMap<GrowingMedium, CreateGrowingMediumCommand>().ReverseMap();
            CreateMap<GrowingMedium, CreateGrowingMediumResponse>().ReverseMap();
            CreateMap<GrowingMedium, UpdateGrowingMediumCommand>().ReverseMap();
            CreateMap<GrowingMedium, UpdateGrowingMediumResponse>().ReverseMap();
        }
    }
}
