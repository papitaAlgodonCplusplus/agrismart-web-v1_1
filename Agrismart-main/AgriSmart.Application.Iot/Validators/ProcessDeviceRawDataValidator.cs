using FluentValidation;
using AgriSmart.Application.Iot.Resources;
using AgriSmart.Application.Iot.Commands;

namespace AgriSmart.Application.Iot.Validators
{
    public class ProcessDeviceRawDataValidator : AbstractValidator<ProcessDeviceRawDataCommand>
    {
        public ProcessDeviceRawDataValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(ValidationMessages.AddDeviceRawDataError);
        }

        private bool AreFiltersValid(ProcessDeviceRawDataCommand command)
        {
            if (string.IsNullOrEmpty(command.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.DeviceId?.ToString()))
                return false;

            return true;
        }
    }
}
