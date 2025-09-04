using FluentValidation;
using AgriSmart.Application.Iot.Resources;
using AgriSmart.Application.Iot.Commands;

namespace AgriSmart.Application.Iot.Validators
{
    public class AddMqttDeviceRawDataValidator : AbstractValidator<AddMqttDeviceRawDataCommand>
    {
        public AddMqttDeviceRawDataValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(ValidationMessages.AddDeviceRawDataError);
        }

        private bool AreFiltersValid(AddMqttDeviceRawDataCommand command)
        {
            if (string.IsNullOrEmpty(command.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.DeviceId?.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.RecordDate.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.Sensor?.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.Payload?.ToString()))
                return false;

            return true;
        }
    }
}
