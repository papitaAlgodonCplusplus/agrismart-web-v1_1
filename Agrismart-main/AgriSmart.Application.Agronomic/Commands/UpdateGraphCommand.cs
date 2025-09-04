using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateGraphCommand : IRequest<Response<UpdateGraphResponse>>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? SummaryTimeScale { get; set; }
        public string? YAxisScaleType { get; set; }
        public string? Series { get; set; }
        public bool Active { get; set; }
    }
}
