using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class GraphMappingProfile : AutoMapper.Profile
    {
        public GraphMappingProfile()
        {
            CreateMap<Graph, CreateGraphCommand>().ReverseMap();
            CreateMap<Graph, CreateGraphResponse>().ReverseMap();
        }
    }
}
