using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropProductionDeviceValidator : BaseValidator<CreateCropProductionDeviceCommand>
    {
        public CreateCropProductionDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropProductionDeviceCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.DeviceId.ToString()))
                return false;
            return true;
        }
    }
}