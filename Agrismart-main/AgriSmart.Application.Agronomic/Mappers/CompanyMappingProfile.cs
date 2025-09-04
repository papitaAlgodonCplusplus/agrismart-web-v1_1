using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class CompanyMappingProfile : AutoMapper.Profile
    {
        public CompanyMappingProfile() {
            CreateMap<Company, CreateCompanyCommand>().ReverseMap();
            CreateMap<Company, CreateCompanyResponse>().ReverseMap();
            CreateMap<Company, UpdateCompanyCommand>().ReverseMap();
            CreateMap<Company, UpdateCompanyResponse>().ReverseMap();
            CreateMap<Company, GetCompanyByIdResponse>().ReverseMap();
        }
    }
}