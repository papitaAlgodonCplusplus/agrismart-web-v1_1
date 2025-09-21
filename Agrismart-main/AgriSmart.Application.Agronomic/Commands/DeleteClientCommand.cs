using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteClientCommand : IRequest<Response<DeleteClientResponse>>
    {
        public int Id { get; set; }
    }
}