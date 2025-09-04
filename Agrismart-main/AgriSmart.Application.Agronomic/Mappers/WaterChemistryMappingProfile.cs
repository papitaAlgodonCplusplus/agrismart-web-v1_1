using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class WaterChemistryMappingProfile : AutoMapper.Profile
    {
        public WaterChemistryMappingProfile()
        {
            CreateMap<WaterChemistry, CreateWaterChemistryCommand>().ReverseMap();
            CreateMap<WaterChemistry, CreateWaterChemistryResponse>().ReverseMap();
            CreateMap<WaterChemistry, UpdateWaterChemistryCommand>().ReverseMap();
            CreateMap<WaterChemistry, UpdateWaterChemistryResponse>().ReverseMap();
        }
    }
}