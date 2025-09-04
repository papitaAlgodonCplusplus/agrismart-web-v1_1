using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllCropProductionIrrigationSectorsValidator : BaseValidator<GetAllCropProductionIrrigationSectorsQuery>
    {
        public GetAllCropProductionIrrigationSectorsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllCropProductionIrrigationSectorsQuery query)
        {
            if (string.IsNullOrEmpty(query.CompanyId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.FarmId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.ProductionUnitId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.CropProductionId.ToString()))
                return false;

            return true;
        }
    }
}