using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllCropProductionDevicesValidator : BaseValidator<GetAllCropProductionDevicesQuery>
    {
        public GetAllCropProductionDevicesValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllCropProductionDevicesQuery query)
        {
            if (string.IsNullOrEmpty(query.CropProductionId.ToString()))
                return false;

            return true;
        }
    }
}