using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropProductionSpecsByIdQueryHandler : IRequestHandler<GetCropProductionSpecsByIdQuery, Response<GetCropProductionSpecsByIdResponse>>
    {
        private readonly ICropProductionSpecsQueryRepository _repository;

        public GetCropProductionSpecsByIdQueryHandler(ICropProductionSpecsQueryRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<GetCropProductionSpecsByIdResponse>> Handle(GetCropProductionSpecsByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var specs = await _repository.GetByIdAsync(request.Id);

                if (specs == null)
                {
                    return new Response<GetCropProductionSpecsByIdResponse>
                    {
                        Success = false,
                        Exception = "Crop production specs not found"
                    };
                }

                var response = new GetCropProductionSpecsByIdResponse
                {
                    CropProductionSpecs = specs
                };

                return new Response<GetCropProductionSpecsByIdResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetCropProductionSpecsByIdResponse>(ex);
            }
        }
    }
}
