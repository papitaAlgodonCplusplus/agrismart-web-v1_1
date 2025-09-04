using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class ProcessCropProductionRawDataMeasurementsValidator : BaseValidator<ProcessCropProductionRawDataMeasurementsCommand>
    {
        public ProcessCropProductionRawDataMeasurementsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(ProcessCropProductionRawDataMeasurementsCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;

            return true;
        }
    }
}