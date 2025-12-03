using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetSoilAnalysisByIdValidator : BaseValidator<GetSoilAnalysisByIdQuery>
    {
        public GetSoilAnalysisByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetSoilAnalysisByIdQuery query)
        {
            if (query.Id <= 0)
                return false;
            return true;
        }
    }
}
