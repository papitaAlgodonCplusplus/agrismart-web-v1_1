using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;


namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CalculationSettingMappingProfile : AutoMapper.Profile
    {
        public CalculationSettingMappingProfile() {
            CreateMap<CalculationSetting, CreateCalculationSettingCommand>().ReverseMap();
            CreateMap<CalculationSetting, CreateCalculationSettingResponse>().ReverseMap();
            CreateMap<CalculationSetting, UpdateCalculationSettingCommand>().ReverseMap();
            CreateMap<CalculationSetting, UpdateCalculationSettingResponse>().ReverseMap();
            CreateMap<DeleteCalculationSettingCommand, CalculationSetting>();
        }
    }
}
