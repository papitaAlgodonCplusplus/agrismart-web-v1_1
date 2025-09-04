using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCalculationSettingByIdHandler : IRequestHandler<GetCalculationSettingByIdQuery, Response<GetCalculationSettingByIdResponse>>
    {
        private readonly ICalculationSettingQueryRepository _CalculationSettingQueryRepository;

        public GetCalculationSettingByIdHandler(ICalculationSettingQueryRepository CalculationSettingQueryRepository)
        {
            _CalculationSettingQueryRepository = CalculationSettingQueryRepository;          
        }

        public async Task<Response<GetCalculationSettingByIdResponse>> Handle(GetCalculationSettingByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCalculationSettingByIdValidator validator = new GetCalculationSettingByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCalculationSettingByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _CalculationSettingQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCalculationSettingByIdResponse getObjectByIdResponse = new GetCalculationSettingByIdResponse();
                    getObjectByIdResponse.CalculationSetting = getResult;
                    return new Response<GetCalculationSettingByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCalculationSettingByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCalculationSettingByIdResponse>(ex);
            }
        }
    }
}