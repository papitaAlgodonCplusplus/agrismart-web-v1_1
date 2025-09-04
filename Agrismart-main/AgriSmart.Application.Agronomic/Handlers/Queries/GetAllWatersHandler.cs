using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllWatersHandler : IRequestHandler<GetAllWatersQuery, Response<GetAllWatersResponse>>
    {
        private readonly IWaterQueryRepository _waterQueryRepository;

        public GetAllWatersHandler(IWaterQueryRepository waterQueryRepository)
        {
            _waterQueryRepository = waterQueryRepository;
        }

        public async Task<Response<GetAllWatersResponse>> Handle(GetAllWatersQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllWatersValidator validator = new GetAllWatersValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllWatersResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _waterQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllWatersResponse getAllWatersResponse = new GetAllWatersResponse();
                    getAllWatersResponse.Waters = getAllResult;
                    return new Response<GetAllWatersResponse>(getAllWatersResponse);
                }
                return new Response<GetAllWatersResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllWatersResponse>(ex);
            }
        }
    }
}