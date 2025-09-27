
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateFarmCommand : IRequest<Response<CreateFarmResponse>>
    {
        public int CompanyId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId { get; set; }
        
        // NEW PROPERTIES
        public string? Location { get; set; }
        public string? Address { get; set; }
        public decimal? Area { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Climate { get; set; }
        public string? SoilType { get; set; }
    }
}