using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropProductionByIdHandler : IRequestHandler<GetCropProductionByIdQuery, Response<GetCropProductionByIdResponse>>
    {
        private readonly ICropProductionQueryRepository _cropProductionQueryRepository;

        public GetCropProductionByIdHandler(ICropProductionQueryRepository cropProductionQueryRepository)
        {
            _cropProductionQueryRepository = cropProductionQueryRepository;          
        }

        public async Task<Response<GetCropProductionByIdResponse>> Handle(GetCropProductionByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropProductionByIdValidator validator = new GetCropProductionByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropProductionByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropProductionQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCropProductionByIdResponse  getObjectByIdResponse = new GetCropProductionByIdResponse();
                    getObjectByIdResponse.CropProduction = getResult;
                    return new Response<GetCropProductionByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropProductionByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropProductionByIdResponse>(ex);
            }
        }
    }
}
