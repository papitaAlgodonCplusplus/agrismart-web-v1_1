using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CatalogMappingProfile : AutoMapper.Profile
    {
        public CatalogMappingProfile() {
            CreateMap<Catalog, CreateCatalogCommand>().ReverseMap();
            CreateMap<Catalog, CreateCatalogResponse>().ReverseMap();
            CreateMap<Catalog, UpdateCatalogCommand>().ReverseMap();
            CreateMap<Catalog, UpdateCatalogResponse>().ReverseMap();
        }
    }
}