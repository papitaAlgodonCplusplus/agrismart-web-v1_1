using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateLicenseValidator : BaseValidator<CreateLicenseCommand>
    {
        public CreateLicenseValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateLicenseCommand command)
        {
            if (string.IsNullOrEmpty(command.ClientId.ToString()))
                return false;          
            return true;
        }
    }
}