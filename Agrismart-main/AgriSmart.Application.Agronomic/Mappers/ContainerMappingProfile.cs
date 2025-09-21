using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class ContainerMappingProfile : AutoMapper.Profile
    {
        public ContainerMappingProfile() {
            CreateMap<Container, CreateContainerCommand>().ReverseMap();
            CreateMap<Container, CreateContainerResponse>().ReverseMap();
            CreateMap<Container, UpdateContainerCommand>().ReverseMap();
            CreateMap<Container, UpdateContainerResponse>().ReverseMap();
            CreateMap<DeleteContainerCommand, Container>();
        }
    }
}