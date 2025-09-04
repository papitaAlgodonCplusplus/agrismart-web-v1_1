using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropPhaseByIdHandler : IRequestHandler<GetCropPhaseByIdQuery, Response<GetCropPhaseByIdResponse>>
    {
        private readonly ICropPhaseQueryRepository _cropPhaseQueryRepository;

        public GetCropPhaseByIdHandler(ICropPhaseQueryRepository cropPhaseQueryRepository)
        {
            _cropPhaseQueryRepository = cropPhaseQueryRepository;          
        }

        public async Task<Response<GetCropPhaseByIdResponse>> Handle(GetCropPhaseByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropPhaseByIdValidator validator = new GetCropPhaseByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropPhaseByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropPhaseQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCropPhaseByIdResponse getObjectByIdResponse = new GetCropPhaseByIdResponse();
                    getObjectByIdResponse.CropPhase = getResult;
                    return new Response<GetCropPhaseByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropPhaseByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropPhaseByIdResponse>(ex);
            }
        }
    }
}
