using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class IrrigationEventMappingProfile : AutoMapper.Profile
    {
        public IrrigationEventMappingProfile()
        {
            CreateMap<IrrigationEvent, CreateIrrigationEventCommand>().ReverseMap();
            CreateMap<IrrigationEvent, CreateIrrigationEventResponse>().ReverseMap();
        }
    }
}
