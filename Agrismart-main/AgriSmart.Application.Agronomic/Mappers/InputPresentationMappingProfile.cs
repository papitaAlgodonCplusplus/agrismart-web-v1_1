using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class InputPresentationMappingProfile : AutoMapper.Profile
    {
        public InputPresentationMappingProfile()
        {
            CreateMap<InputPresentation, CreateInputPresentationCommand>().ReverseMap();
            CreateMap<InputPresentation, CreateInputPresentationResponse>().ReverseMap();
            CreateMap<InputPresentation, UpdateInputPresentationCommand>().ReverseMap();
            CreateMap<InputPresentation, UpdateInputPresentationResponse>().ReverseMap();
        }
    }
}
