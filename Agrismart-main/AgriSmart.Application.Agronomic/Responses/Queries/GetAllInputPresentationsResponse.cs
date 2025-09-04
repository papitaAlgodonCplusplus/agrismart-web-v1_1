using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllInputPresentationsResponse
    {
        public IReadOnlyList<InputPresentation>? InputPresentations { get; set; } = new List<InputPresentation>();
    }
}
