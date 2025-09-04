using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllRelayModuleCropProductionIrrigationSectorsValidator : BaseValidator<GetAllRelayModuleCropProductionIrrigationSectorsQuery>
    {
        public GetAllRelayModuleCropProductionIrrigationSectorsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllRelayModuleCropProductionIrrigationSectorsQuery query)
        {
            if (string.IsNullOrEmpty(query.RelayModuleId.ToString()))
                return false;            
            return true;
        }
    }
}