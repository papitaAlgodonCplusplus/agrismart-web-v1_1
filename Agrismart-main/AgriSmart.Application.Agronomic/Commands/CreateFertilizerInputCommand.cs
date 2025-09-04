using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateFertilizerInputCommand : IRequest<Response<CreateFertilizerInputResponse>>
    {
        public int CatalogId { get; set; }
        public int InputPresentationId { get; set; }
        public int FertilizerId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
    }
}
