using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateContainerTypeCommand : IRequest<Response<UpdateContainerTypeResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int FormulaType { get; set; }
        public bool Active { get; set; }
    }
}
