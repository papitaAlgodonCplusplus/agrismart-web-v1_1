using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateCropPhaseOptimalValidator : BaseValidator<UpdateCropPhaseOptimalCommand>
    {
        public UpdateCropPhaseOptimalValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateCropPhaseOptimalCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Description == null || string.IsNullOrEmpty(command.Description?.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Value.ToString()))
                return false;
            return true;
        }
    }
}