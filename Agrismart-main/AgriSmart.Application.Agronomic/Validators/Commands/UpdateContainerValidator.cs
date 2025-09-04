using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateContainerValidator : BaseValidator<UpdateContainerCommand>
    {
        public UpdateContainerValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateContainerCommand command)
        {
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