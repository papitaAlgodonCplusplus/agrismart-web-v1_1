using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteFertilizerInputCommand : IRequest<Response<DeleteFertilizerInputResponse>>
    {
        public int Id { get; set; }
    }
}