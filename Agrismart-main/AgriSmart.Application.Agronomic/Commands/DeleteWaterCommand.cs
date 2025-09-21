using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteWaterCommand : IRequest<Response<DeleteWaterResponse>>
    {
        public int Id { get; set; }
    }
}