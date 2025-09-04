using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllCropPhaseOptimalsValidator : BaseValidator<GetAllCropPhaseOptimalsQuery>
    {
        public GetAllCropPhaseOptimalsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllCropPhaseOptimalsQuery query)
        {
            if (string.IsNullOrEmpty(query.IncludeInactives.ToString()))
                return false;
            return true;
        }
    }
}