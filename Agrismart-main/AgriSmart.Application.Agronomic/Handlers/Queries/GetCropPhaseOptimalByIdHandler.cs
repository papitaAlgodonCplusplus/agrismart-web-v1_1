using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropPhaseOptimalByIdHandler : IRequestHandler<GetCropPhaseOptimalByIdQuery, Response<GetCropPhaseOptimalByIdResponse>>
    {
        private readonly ICropPhaseOptimalQueryRepository _cropPhaseOptimalQueryRepository;

        public GetCropPhaseOptimalByIdHandler(ICropPhaseOptimalQueryRepository cropPhaseOptimalQueryRepository)
        {
            _cropPhaseOptimalQueryRepository = cropPhaseOptimalQueryRepository;          
        }

        public async Task<Response<GetCropPhaseOptimalByIdResponse>> Handle(GetCropPhaseOptimalByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropPhaseOptimalByIdValidator validator = new GetCropPhaseOptimalByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropPhaseOptimalByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropPhaseOptimalQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCropPhaseOptimalByIdResponse getObjectByIdResponse = new GetCropPhaseOptimalByIdResponse();
                    getObjectByIdResponse.CropPhaseOptimal = getResult;
                    return new Response<GetCropPhaseOptimalByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropPhaseOptimalByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropPhaseOptimalByIdResponse>(ex);
            }
        }
    }
}