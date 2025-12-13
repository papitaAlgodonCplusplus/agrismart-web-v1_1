using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateCropProductionSpecsValidator : BaseValidator<UpdateCropProductionSpecsCommand>
    {
        public UpdateCropProductionSpecsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateCropProductionSpecsCommand command)
        {
            if (command.Id <= 0)
                return false;
            if (string.IsNullOrEmpty(command.Name))
                return false;
            if (command.BetweenRowDistance <= 0)
                return false;
            if (command.BetweenContainerDistance <= 0)
                return false;
            if (command.BetweenPlantDistance <= 0)
                return false;
            if (command.Area <= 0)
                return false;
            if (command.ContainerVolume <= 0)
                return false;
            if (command.AvailableWaterPercentage < 0 || command.AvailableWaterPercentage > 100)
                return false;

            return true;
        }
    }
}
