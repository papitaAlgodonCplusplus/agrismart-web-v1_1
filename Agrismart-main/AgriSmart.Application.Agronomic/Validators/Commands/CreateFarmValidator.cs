using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateFarmValidator : BaseValidator<CreateFarmCommand>
    {
        public CreateFarmValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateFarmCommand command)
        {
            if (string.IsNullOrEmpty(command.CompanyId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Description == null || string.IsNullOrEmpty(command.Description?.ToString()))
                return false;            
            return true;
        }
    }
}