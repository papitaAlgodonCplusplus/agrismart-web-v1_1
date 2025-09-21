using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CropMappingProfile : AutoMapper.Profile
    {
        public CropMappingProfile()
        {
            CreateMap<Crop, CreateCropCommand>().ReverseMap();
            CreateMap<Crop, CreateCropResponse>().ReverseMap();
            CreateMap<Crop, UpdateCropCommand>().ReverseMap();
            CreateMap<Crop, UpdateCropResponse>().ReverseMap();
            CreateMap<DeleteCropCommand, Crop>();
        }
    }
}