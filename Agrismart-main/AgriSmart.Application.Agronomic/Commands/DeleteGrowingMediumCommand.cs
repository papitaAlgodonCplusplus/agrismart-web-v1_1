using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteGrowingMediumCommand : IRequest<Response<DeleteGrowingMediumResponse>>
    {
        public int Id { get; set; }
    }
}