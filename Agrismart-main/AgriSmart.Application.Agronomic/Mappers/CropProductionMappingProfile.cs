using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropProductionMappingProfile : AutoMapper.Profile
    {
        public CropProductionMappingProfile() {
            CreateMap<CropProduction, CreateCropProductionCommand>().ReverseMap();
            CreateMap<CropProduction, CreateCropProductionResponse>().ReverseMap();
            CreateMap<CropProduction, UpdateCropProductionCommand>().ReverseMap();
            CreateMap<CropProduction, UpdateCropProductionResponse>().ReverseMap();
        }
    }
}
