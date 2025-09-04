using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateGrowingMediumValidator : BaseValidator<UpdateGrowingMediumCommand>
    {
        public UpdateGrowingMediumValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateGrowingMediumCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Name.ToString()))
                return false;         
            return true;
        }
    }
}