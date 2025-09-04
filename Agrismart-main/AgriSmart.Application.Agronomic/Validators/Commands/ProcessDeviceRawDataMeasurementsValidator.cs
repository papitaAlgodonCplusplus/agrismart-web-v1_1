using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class ProcessDeviceRawDataMeasurementsValidator : BaseValidator<ProcessDeviceRawDataMeasurementsCommand>
    {
        public ProcessDeviceRawDataMeasurementsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(ProcessDeviceRawDataMeasurementsCommand command)
        {
            if (string.IsNullOrEmpty(command.DeviceId.ToString()))
                return false;

            return true;
        }
    }
}