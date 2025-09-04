using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class AnalyticalEntityProfile : AutoMapper.Profile
    {
        public AnalyticalEntityProfile()
        {
            CreateMap<AnalyticalEntity, CreateAnaliticalEntityCommand>().ReverseMap();
            CreateMap<AnalyticalEntity, CreateAnalyticalEntityResponse>().ReverseMap();
        }
    }
}
