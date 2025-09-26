using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetCropPhaseSolutionRequirementByIdValidator : BaseValidator<GetCropPhaseSolutionRequirementByIdQuery>
    {
        public GetCropPhaseSolutionRequirementByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetCropPhaseSolutionRequirementByIdQuery query)
        {
            if (query.Id <= 0)
                return false;
            return true;
        }
    }
}