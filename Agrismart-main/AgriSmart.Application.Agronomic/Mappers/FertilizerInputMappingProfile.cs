using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class FertilizerInputMappingProfile : AutoMapper.Profile
    {
        public FertilizerInputMappingProfile()
        {
            CreateMap<FertilizerInput, CreateFertilizerInputCommand>().ReverseMap();
            CreateMap<FertilizerInput, CreateFertilizerInputResponse>().ReverseMap();
            CreateMap<FertilizerInput, UpdateFertilizerInputCommand>().ReverseMap();
            CreateMap<FertilizerInput, UpdateFertilizerInputResponse>().ReverseMap();
        }
    }
}
