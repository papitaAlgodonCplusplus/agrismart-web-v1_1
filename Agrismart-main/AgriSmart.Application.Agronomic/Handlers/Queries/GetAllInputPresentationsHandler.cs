using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllInputPresentationsHandler : IRequestHandler<GetAllInputPresentationsQuery, Response<GetAllInputPresentationsResponse>>
    {
        private readonly IInputPresentationQueryRepository _inputPresentationQueryRepository;

        public GetAllInputPresentationsHandler(IInputPresentationQueryRepository inputPresentationQueryRepository)
        {
            _inputPresentationQueryRepository = inputPresentationQueryRepository;
        }

        public async Task<Response<GetAllInputPresentationsResponse>> Handle(GetAllInputPresentationsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllInputPresentationsValidator validator = new GetAllInputPresentationsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllInputPresentationsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _inputPresentationQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllInputPresentationsResponse getAllInputPresentationsResponse = new GetAllInputPresentationsResponse();
                    getAllInputPresentationsResponse.InputPresentations = getAllResult;
                    return new Response<GetAllInputPresentationsResponse>(getAllInputPresentationsResponse);
                }
                return new Response<GetAllInputPresentationsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllInputPresentationsResponse>(ex);
            }
        }
    }
}
