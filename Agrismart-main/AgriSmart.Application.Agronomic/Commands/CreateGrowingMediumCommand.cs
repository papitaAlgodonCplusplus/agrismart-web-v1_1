using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateGrowingMediumCommand : IRequest<Response<CreateGrowingMediumResponse>>
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
    }
}
