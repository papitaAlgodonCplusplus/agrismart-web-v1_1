using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class IrrigationMeasurementMappingProfile : AutoMapper.Profile
    {
        public IrrigationMeasurementMappingProfile()
        {
            CreateMap<IrrigationMeasurement, CreateIrrigationEventMeasurementCommand>().ReverseMap();
            CreateMap<IrrigationMeasurement, CreateIrrigationEventResponse>().ReverseMap();
        }
    }
}
