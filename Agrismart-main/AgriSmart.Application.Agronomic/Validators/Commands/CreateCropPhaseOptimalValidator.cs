using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropPhaseOptimalValidator : BaseValidator<CreateCropPhaseOptimalCommand>
    {
        public CreateCropPhaseOptimalValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropPhaseOptimalCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;            
            if (string.IsNullOrEmpty(command.Description))
                return false;
            if (string.IsNullOrEmpty(command.Value.ToString()))
                return false;
            return true;
        }
    }
}