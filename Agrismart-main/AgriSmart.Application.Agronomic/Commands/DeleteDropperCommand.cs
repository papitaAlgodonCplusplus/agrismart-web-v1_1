using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteDropperCommand : IRequest<Response<DeleteDropperResponse>>
    {
        public int Id { get; set; }
    }
}