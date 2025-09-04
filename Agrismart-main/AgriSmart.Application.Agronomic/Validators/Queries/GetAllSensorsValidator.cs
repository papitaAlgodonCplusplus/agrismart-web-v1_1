using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllSensorsValidator : BaseValidator<GetAllSensorsQuery>
    {
        public GetAllSensorsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllSensorsQuery query)
        {
            if (string.IsNullOrEmpty(query.CompanyId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.CompanyId.ToString()))
                return false;
            return true;
        }
    }
}