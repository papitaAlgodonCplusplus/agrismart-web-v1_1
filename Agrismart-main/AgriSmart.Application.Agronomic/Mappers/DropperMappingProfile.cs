using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class DropperMappingProfile : AutoMapper.Profile
    {
        public DropperMappingProfile() {
            CreateMap<Dropper, CreateDropperCommand>().ReverseMap();
            CreateMap<Dropper, CreateDropperResponse>().ReverseMap();
            CreateMap<Dropper, UpdateDropperCommand>().ReverseMap();
            CreateMap<Dropper, UpdateDropperResponse>().ReverseMap();
            CreateMap<DeleteDropperCommand, Dropper>();
        }
    }
}