using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class FertilizerChemistryMappingProfile : AutoMapper.Profile
    {
        public FertilizerChemistryMappingProfile()
        {
            CreateMap<FertilizerChemistry, CreateFertilizerChemistryCommand>().ReverseMap();
            CreateMap<FertilizerChemistry, CreateFertilizerChemistryResponse>().ReverseMap();
            CreateMap<FertilizerChemistry, UpdateFertilizerChemistryCommand>().ReverseMap();
            CreateMap<FertilizerChemistry, UpdateFertilizerChemistryResponse>().ReverseMap();
        }
    }
}
