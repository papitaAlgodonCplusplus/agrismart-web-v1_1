using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetWaterByIdHandler : IRequestHandler<GetWaterByIdQuery, Response<GetWaterByIdResponse>>
    {
        private readonly IWaterQueryRepository _waterQueryRepository;

        public GetWaterByIdHandler(IWaterQueryRepository waterQueryRepository)
        {
            _waterQueryRepository = waterQueryRepository;
        }

        public async Task<Response<GetWaterByIdResponse>> Handle(GetWaterByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetWaterByIdValidator validator = new GetWaterByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetWaterByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _waterQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetWaterByIdResponse getObjectByIdResponse = new GetWaterByIdResponse();
                    getObjectByIdResponse.Water = getResult;
                    return new Response<GetWaterByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetWaterByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetWaterByIdResponse>(ex);
            }
        }
    }
}