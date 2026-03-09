using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateContainerTypeCommand : IRequest<Response<CreateContainerTypeResponse>>
    {
        public string Name { get; set; }
        public int FormulaType { get; set; }
    }
}
