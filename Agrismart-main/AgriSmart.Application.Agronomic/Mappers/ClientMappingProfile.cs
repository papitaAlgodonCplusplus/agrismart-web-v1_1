using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class ClientMappingProfile : AutoMapper.Profile
    {
        public ClientMappingProfile()
        {
            CreateMap<Client, CreateClientCommand>().ReverseMap();
            CreateMap<Client, CreateClientResponse>().ReverseMap();
            CreateMap<Client, UpdateClientCommand>().ReverseMap();
            CreateMap<Client, UpdateClientResponse>().ReverseMap();
        }
    }
}
