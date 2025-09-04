using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropByIdHandler : IRequestHandler<GetCropByIdQuery, Response<GetCropByIdResponse>>
    {
        private readonly ICropQueryRepository _cropQueryRepository;

        public GetCropByIdHandler(ICropQueryRepository cropQueryRepository)
        {
            _cropQueryRepository = cropQueryRepository;          
        }

        public async Task<Response<GetCropByIdResponse>> Handle(GetCropByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCropByIdValidator validator = new GetCropByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCropByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _cropQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCropByIdResponse getObjectByIdResponse = new GetCropByIdResponse();
                    getObjectByIdResponse.Crop = getResult;
                    return new Response<GetCropByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCropByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCropByIdResponse>(ex);
            }
        }
    }
}
