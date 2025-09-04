using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetInputPresentationByIdHandler : IRequestHandler<GetInputPresentationByIdQuery, Response<GetInputPresentationByIdResponse>>
    {
        private readonly IInputPresentationQueryRepository _inputPresentationQueryRepository;

        public GetInputPresentationByIdHandler(IInputPresentationQueryRepository inputPresentationQueryRepository)
        {
            _inputPresentationQueryRepository = inputPresentationQueryRepository;
        }

        public async Task<Response<GetInputPresentationByIdResponse>> Handle(GetInputPresentationByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetInputPresentationByIdValidator validator = new GetInputPresentationByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetInputPresentationByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _inputPresentationQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetInputPresentationByIdResponse getObjectByIdResponse = new GetInputPresentationByIdResponse();
                    getObjectByIdResponse.InputPresentation = getResult;
                    return new Response<GetInputPresentationByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetInputPresentationByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetInputPresentationByIdResponse>(ex);
            }
        }
    }
}
