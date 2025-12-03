using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteSoilAnalysisCommand : IRequest<Response<DeleteSoilAnalysisResponse>>
    {
        public int Id { get; set; }
    }
}
