using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropProductionSpecsQueryHandler : IRequestHandler<GetAllCropProductionSpecsQuery, Response<GetAllCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsQueryRepository _repository;

        public GetAllCropProductionSpecsQueryHandler(ICropProductionSpecsQueryRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<GetAllCropProductionSpecsResponse>> Handle(GetAllCropProductionSpecsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var specs = await _repository.GetAllAsync(request.IncludeInactives);

                var response = new GetAllCropProductionSpecsResponse
                {
                    CropProductionSpecs = specs
                };

                return new Response<GetAllCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropProductionSpecsResponse>(ex);
            }
        }
    }
}
