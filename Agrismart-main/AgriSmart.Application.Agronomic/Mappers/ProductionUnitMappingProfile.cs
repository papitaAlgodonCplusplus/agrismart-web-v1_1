using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class ProductionUnitMappingProfile : AutoMapper.Profile
    {
        public ProductionUnitMappingProfile()
        {
            CreateMap<ProductionUnit, CreateProductionUnitCommand>().ReverseMap();
            CreateMap<ProductionUnit, CreateProductionUnitResponse>().ReverseMap();
        }
    }
}
