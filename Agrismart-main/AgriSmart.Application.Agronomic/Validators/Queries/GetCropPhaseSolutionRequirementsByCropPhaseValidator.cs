using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetCropPhaseSolutionRequirementsByCropPhaseValidator : BaseValidator<GetCropPhaseSolutionRequirementsByCropPhaseQuery>
    {
        public GetCropPhaseSolutionRequirementsByCropPhaseValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetCropPhaseSolutionRequirementsByCropPhaseQuery query)
        {
            if (query.CropPhaseId <= 0)
                return false;
            return true;
        }
    }
}