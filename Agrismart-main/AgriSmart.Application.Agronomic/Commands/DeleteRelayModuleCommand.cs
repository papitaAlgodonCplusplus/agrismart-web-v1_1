using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteRelayModuleCommand : IRequest<Response<DeleteRelayModuleResponse>>
    {
        public int Id { get; set; }
    }
}