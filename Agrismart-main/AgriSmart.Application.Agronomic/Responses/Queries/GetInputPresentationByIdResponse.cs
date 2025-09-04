using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetInputPresentationByIdResponse
    {
        public InputPresentation ? InputPresentation { get; set; } = new InputPresentation();
    }
}
