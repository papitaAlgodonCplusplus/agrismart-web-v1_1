using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateLicenseValidator : BaseValidator<UpdateLicenseCommand>
    {
        public UpdateLicenseValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateLicenseCommand command)
        {
            if (string.IsNullOrEmpty(command.ExpirationDate.ToString()))
                return false;            
            if (string.IsNullOrEmpty(command.Active.ToString()))
                return false;
            return true;
        }
    }
}