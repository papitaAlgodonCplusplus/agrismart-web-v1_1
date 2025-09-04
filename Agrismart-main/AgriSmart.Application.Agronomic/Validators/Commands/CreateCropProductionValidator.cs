using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropProductionValidator : BaseValidator<CreateCropProductionCommand>
    {
        public CreateCropProductionValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropProductionCommand command)
        {
            if (string.IsNullOrEmpty(command.CropId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.ProductionUnitId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;            
            if (string.IsNullOrEmpty(command.ContainerId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.GrowingMediumId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Width.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Length.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.BetweenRowDistance.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.BetweenContainerDistance.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.BetweenPlantDistance.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.PlantsPerContainer.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.PlantsPerContainer.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.StartDate.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.EndDate.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.WindSpeedMeasurementHeight.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Altitude.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Latitude.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Longitude.ToString()))
                return false;
            return true;
        }
    }
}