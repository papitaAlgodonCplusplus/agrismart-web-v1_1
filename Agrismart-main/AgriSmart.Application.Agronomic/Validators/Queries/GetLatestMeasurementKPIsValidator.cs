using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetLatestMeasurementKPIsValidator : BaseValidator<GetLatestMeasurementKPIsQuery>
    {
        public GetLatestMeasurementKPIsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetLatestMeasurementKPIsQuery query)
        {
            if (string.IsNullOrEmpty(query.PeriodStartingDate.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.PeriodEndingDate.ToString()))
                return false;
            if(query.PeriodEndingDate < query.PeriodStartingDate) 
                return false;
            return true;
        }
    }
}