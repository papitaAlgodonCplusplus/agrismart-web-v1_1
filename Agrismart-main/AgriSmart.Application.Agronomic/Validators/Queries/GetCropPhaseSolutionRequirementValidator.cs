using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;
using AgriSmart.Application.Agronomic.Responses.Queries;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetCropPhaseSolutionRequirementValidator : BaseValidator<GetCropPhaseSolutionRequirementByIdPhaseQuery>
    {
        public GetCropPhaseSolutionRequirementValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetCropPhaseSolutionRequirementByIdPhaseQuery query)
        {
            if (string.IsNullOrEmpty(query.PhaseId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.IncludeInactives.ToString()))
                return false;
            return true;
        }
    }
}