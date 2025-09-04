using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateInputPresentationValidator : BaseValidator<CreateInputPresentationCommand>
    {
        public CreateInputPresentationValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateInputPresentationCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.MeasurementUnitId == null)
                return false;
            if (string.IsNullOrEmpty(command.Quantity.ToString()))
                return false;

            return true;
        }
    }
}