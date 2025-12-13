using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropProductionSpecsCommand : IRequest<Response<DeleteCropProductionSpecsResponse>>
    {
        public int Id { get; set; }
        public int DeletedBy { get; set; }
    }
}
