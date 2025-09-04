using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class FertilizerMappingProfile : AutoMapper.Profile
    {
        public FertilizerMappingProfile()
        {
            CreateMap<Fertilizer, CreateFertilizerCommand>().ReverseMap();
            CreateMap<Fertilizer, CreateFertilizerResponse>().ReverseMap();
        }
    }
}
