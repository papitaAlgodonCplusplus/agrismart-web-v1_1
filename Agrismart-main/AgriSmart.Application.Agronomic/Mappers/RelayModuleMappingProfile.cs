using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class RelayModuleMappingProfile : AutoMapper.Profile
    {
        public RelayModuleMappingProfile()
        {
            CreateMap<RelayModule, CreateRelayModuleCommand>().ReverseMap();
            CreateMap<RelayModule, CreateRelayModuleResponse>().ReverseMap();
            CreateMap<RelayModule, UpdateRelayModuleCommand>().ReverseMap();
            CreateMap<RelayModule, UpdateRelayModuleResponse>().ReverseMap();
        }
    }
}
