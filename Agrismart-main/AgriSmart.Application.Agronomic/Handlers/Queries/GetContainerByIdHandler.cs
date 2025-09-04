using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetContainerByIdHandler : IRequestHandler<GetContainerByIdQuery, Response<GetContainerByIdResponse>>
    {
        private readonly IContainerQueryRepository _containerQueryRepository;

        public GetContainerByIdHandler(IContainerQueryRepository containerQueryRepository)
        {
            _containerQueryRepository = containerQueryRepository;             
        }

        public async Task<Response<GetContainerByIdResponse>> Handle(GetContainerByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetContainerByIdValidator validator = new GetContainerByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetContainerByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _containerQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetContainerByIdResponse getObjectByIdResponse = new GetContainerByIdResponse();
                    getObjectByIdResponse.Container = getResult;
                    return new Response<GetContainerByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetContainerByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetContainerByIdResponse>(ex);
            }
        }
    }
}
