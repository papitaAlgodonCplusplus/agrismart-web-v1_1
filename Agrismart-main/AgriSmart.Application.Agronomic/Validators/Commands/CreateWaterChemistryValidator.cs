using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateWaterChemistryValidator : BaseValidator<CreateWaterChemistryCommand>
    {
        public CreateWaterChemistryValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateWaterChemistryCommand command)
        {
            if (string.IsNullOrEmpty(command.WaterId.ToString()))
                return false;
            return true;
        }
    }
}