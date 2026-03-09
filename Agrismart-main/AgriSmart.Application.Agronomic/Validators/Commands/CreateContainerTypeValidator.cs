using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateContainerTypeValidator : BaseValidator<CreateContainerTypeCommand>
    {
        public CreateContainerTypeValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateContainerTypeCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.Name))
                return false;
            if (command.FormulaType < 1 || command.FormulaType > 3)
                return false;
            return true;
        }
    }
}
