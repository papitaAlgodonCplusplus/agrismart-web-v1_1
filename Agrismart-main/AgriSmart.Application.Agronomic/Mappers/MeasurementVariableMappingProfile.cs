using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class MeasurementVariableMappingProfile : AutoMapper.Profile
    {
        public MeasurementVariableMappingProfile() {
            CreateMap<MeasurementVariable, CreateMeasurementVariableCommand>().ReverseMap();
            CreateMap<MeasurementVariable, CreateMeasurementVariableResponse>().ReverseMap();
            CreateMap<MeasurementVariable, UpdateMeasurementVariableCommand>().ReverseMap();
            CreateMap<MeasurementVariable, UpdateMeasurementVariablerResponse>().ReverseMap();
        }
    }
}