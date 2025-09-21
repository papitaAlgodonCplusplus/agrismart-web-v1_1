using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class FarmMappingProfile : AutoMapper.Profile
    {
        public FarmMappingProfile()
        {
            CreateMap<Farm, CreateFarmCommand>().ReverseMap();
            CreateMap<Farm, CreateFarmResponse>().ReverseMap();
            CreateMap<DeleteFarmCommand, Farm>();
        }
    }
}
