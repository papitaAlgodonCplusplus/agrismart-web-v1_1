using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropPhaseCommand : IRequest<Response<CreateCropPhaseResponse>>
    {
        public int CropId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int Sequence { get; set; }
        public int StartingWeek { get; set; }
        public int EndingWeek { get; set; }
    }
}
