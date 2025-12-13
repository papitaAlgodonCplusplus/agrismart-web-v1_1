using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropProductionSpecsCommandHandler : IRequestHandler<DeleteCropProductionSpecsCommand, Response<DeleteCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _repository;

        public DeleteCropProductionSpecsCommandHandler(ICropProductionSpecsCommandRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<DeleteCropProductionSpecsResponse>> Handle(DeleteCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _repository.DeleteAsync(request.Id, request.DeletedBy);

                if (!result)
                {
                    return new Response<DeleteCropProductionSpecsResponse>
                    {
                        Success = false,
                        Exception = "Crop production specs not found"
                    };
                }

                var response = new DeleteCropProductionSpecsResponse
                {
                    Id = request.Id
                };

                return new Response<DeleteCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropProductionSpecsResponse>(ex);
            }
        }
    }
}
