using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateFarmCommand : IRequest<Response<UpdateFarmResponse>>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId { get; set; }
        public bool Active { get; set; }
    }
}
