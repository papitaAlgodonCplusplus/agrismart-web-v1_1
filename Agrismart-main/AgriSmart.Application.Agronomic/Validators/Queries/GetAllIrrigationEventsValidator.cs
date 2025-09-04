using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllIrrigationEventsValidator : BaseValidator<GetAllIrrigationEventsQuery>
    {
        public GetAllIrrigationEventsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllIrrigationEventsQuery query)
        {
            if (string.IsNullOrEmpty(query.CropProductionId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.StartingDateTime.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.EndingDateTime.ToString()))
                return false;
            if(query.EndingDateTime <= query.StartingDateTime)
                return false;
            return true;
        }
    }
}