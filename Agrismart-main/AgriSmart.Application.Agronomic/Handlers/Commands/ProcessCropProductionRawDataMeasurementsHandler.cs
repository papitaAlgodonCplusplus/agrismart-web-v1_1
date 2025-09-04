using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class ProcessCropProductionRawDataMeasurementsHandler : IRequestHandler<ProcessCropProductionRawDataMeasurementsCommand, Response<ProcessCropProductionRawDataMeasurementsResponse>>
    {
        private readonly ICropProductionRawDataCommandRepository _cropProductionRawDataCommandRepository;

        public ProcessCropProductionRawDataMeasurementsHandler(ICropProductionRawDataCommandRepository cropProductionRawDataCommandRepository)
        {
            _cropProductionRawDataCommandRepository = cropProductionRawDataCommandRepository;
        }

        public async Task<Response<ProcessCropProductionRawDataMeasurementsResponse>> Handle(ProcessCropProductionRawDataMeasurementsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (ProcessCropProductionRawDataMeasurementsValidator validator = new ProcessCropProductionRawDataMeasurementsValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<ProcessCropProductionRawDataMeasurementsResponse>(new Exception(errors.ToString()));
                }

                var processCropProductionRawDataMeasurementsResult = await _cropProductionRawDataCommandRepository.ProcessCropProductionRawDataMeasurements(command.CropProductionId);

                if (processCropProductionRawDataMeasurementsResult != null)
                {
                    ProcessCropProductionRawDataMeasurementsResponse processCropProductionRawDataMeasurementsResponse = new ProcessCropProductionRawDataMeasurementsResponse();
                    processCropProductionRawDataMeasurementsResponse.TotalMeasurements = processCropProductionRawDataMeasurementsResult;
                    return new Response<ProcessCropProductionRawDataMeasurementsResponse>(processCropProductionRawDataMeasurementsResponse);
                }
                return new Response<ProcessCropProductionRawDataMeasurementsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<ProcessCropProductionRawDataMeasurementsResponse>(ex);
            }
        }
    }
}
