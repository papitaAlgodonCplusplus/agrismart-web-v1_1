using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateContainerValidator : BaseValidator<CreateContainerCommand>
    {
        public CreateContainerValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateContainerCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Name.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.ContainerTypeId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Height.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Width.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Length.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.LowerDiameter.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.UpperDiameter.ToString()))
                return false;

            return true;
        }
    }
}