using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class LicenseMappingProfile : AutoMapper.Profile
    {
        public LicenseMappingProfile()
        {
            CreateMap<License, CreateLicenseCommand>().ReverseMap();
            CreateMap<License, CreateLicenseResponse>().ReverseMap();
            CreateMap<License, UpdateLicenseCommand>().ReverseMap();
            CreateMap<License, UpdateLicenseResponse>().ReverseMap();
        }
    }
}
