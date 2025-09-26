using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllCropPhaseSolutionRequirementsValidator : BaseValidator<GetAllCropPhaseSolutionRequirementsQuery>
    {
        public GetAllCropPhaseSolutionRequirementsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllCropPhaseSolutionRequirementsQuery query)
        {
            return true;
        }
    }
}