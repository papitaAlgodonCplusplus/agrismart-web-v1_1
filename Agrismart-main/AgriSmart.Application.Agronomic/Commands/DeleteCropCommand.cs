using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropCommand : IRequest<Response<DeleteCropResponse>>
    {
        public int Id { get; set; }
    }
}