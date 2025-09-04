using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteCropProductionDeviceValidator : BaseValidator<DeleteCropProductionDeviceCommand>
    {
        public DeleteCropProductionDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteCropProductionDeviceCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.DeviceId.ToString()))
                return false;
            return true;
        }
    }
}