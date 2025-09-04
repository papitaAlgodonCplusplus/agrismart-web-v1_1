using FluentValidation;
using AgriSmart.Application.Iot.Resources;
using AgriSmart.Application.Iot.Commands;

namespace AgriSmart.Application.Iot.Validators
{
    public class AddDeviceRawDataValidator : AbstractValidator<AddDeviceRawDataCommand>
    {
        public AddDeviceRawDataValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(ValidationMessages.AddDeviceRawDataError);
        }

        private bool AreFiltersValid(AddDeviceRawDataCommand command)
        {
            if (string.IsNullOrEmpty(command.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.End_Device_Ids?.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.Received_at?.ToString()))
                return false;

            if (string.IsNullOrEmpty(command.Uplink_Message?.ToString()))
                return false;



            return true;
        }
    }
}
