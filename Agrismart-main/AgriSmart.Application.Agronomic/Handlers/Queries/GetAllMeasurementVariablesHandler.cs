using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementVariablesHandler : BaseHandler, IRequestHandler<GetAllMeasurementVariablesQuery, Response<GetAllMeasurementVariablesResponse>>
    {
        private readonly IMeasurementVariableQueryRepository _measurementVariableRepository;
       

        public GetAllMeasurementVariablesHandler(IMeasurementVariableQueryRepository measurementVariableRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementVariableRepository = measurementVariableRepository;               
        }

        public async Task<Response<GetAllMeasurementVariablesResponse>> Handle(GetAllMeasurementVariablesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementVariablesValidator validator = new GetAllMeasurementVariablesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementVariablesResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementVariableRepository.GetAllAsync(query.CatalogId);

                if (getAllResult != null)
                {
                    GetAllMeasurementVariablesResponse getAllMeasurementVariablesResponse = new GetAllMeasurementVariablesResponse();
                    getAllMeasurementVariablesResponse.MeasurementVariables = getAllResult;
                    return new Response<GetAllMeasurementVariablesResponse>(getAllMeasurementVariablesResponse);
                }
                return new Response<GetAllMeasurementVariablesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementVariablesResponse>(ex);
            }
        }
    }
}
