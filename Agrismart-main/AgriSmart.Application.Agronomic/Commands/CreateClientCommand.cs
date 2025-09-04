using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateClientCommand : IRequest<Response<CreateClientResponse>>
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}
