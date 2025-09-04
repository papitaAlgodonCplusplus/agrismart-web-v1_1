using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateRelayModuleCommand : IRequest<Response<CreateRelayModuleResponse>>
    {
        public string? Name { get; set; }
    }
}
