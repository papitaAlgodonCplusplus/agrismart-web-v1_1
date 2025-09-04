using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetDropperByIdHandler : IRequestHandler<GetDropperByIdQuery, Response<GetDropperByIdResponse>>
    {
        private readonly IDropperQueryRepository _dropperQueryRepository;

        public GetDropperByIdHandler(IDropperQueryRepository dropperQueryRepository)
        {
            _dropperQueryRepository = dropperQueryRepository;                 
        }

        public async Task<Response<GetDropperByIdResponse>> Handle(GetDropperByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetDropperByIdValidator validator = new GetDropperByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetDropperByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _dropperQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetDropperByIdResponse getObjectByIdResponse = new GetDropperByIdResponse();
                    getObjectByIdResponse.Dropper = getResult;
                    return new Response<GetDropperByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetDropperByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetDropperByIdResponse>(ex);
            }
        }
    }
}
