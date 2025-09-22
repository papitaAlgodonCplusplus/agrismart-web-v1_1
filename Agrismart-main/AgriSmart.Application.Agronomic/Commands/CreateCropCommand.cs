using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropCommand : IRequest<Response<CreateCropResponse>>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public double CropBaseTemperature { get; set; }
        public bool Active { get; set; } = true;
    }
}