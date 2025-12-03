using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AutoMapper;

namespace AgriSmart.Application.Agronomic.Mappers
{
    public class SoilAnalysisMappingProfile : AutoMapper.Profile
    {
        public SoilAnalysisMappingProfile()
        {
            CreateMap<SoilAnalysis, CreateSoilAnalysisCommand>().ReverseMap();
            CreateMap<SoilAnalysis, CreateSoilAnalysisResponse>().ReverseMap();
            CreateMap<SoilAnalysis, UpdateSoilAnalysisCommand>().ReverseMap();
            CreateMap<SoilAnalysis, UpdateSoilAnalysisResponse>().ReverseMap();
            CreateMap<DeleteSoilAnalysisCommand, SoilAnalysis>();
        }
    }
}
