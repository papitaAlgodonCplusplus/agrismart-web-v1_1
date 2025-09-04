using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class UserFarmMappingProfile : AutoMapper.Profile
    {
        public UserFarmMappingProfile() {

            CreateMap<UserFarm, CreateUserFarmCommand>().ReverseMap();
            CreateMap<UserFarm, CreateUserFarmResponse>().ReverseMap();
            CreateMap<UserFarm, DeleteUserFarmCommand>().ReverseMap();
            CreateMap<UserFarm, DeleteUserFarmResponse>().ReverseMap();
        }
    }
}