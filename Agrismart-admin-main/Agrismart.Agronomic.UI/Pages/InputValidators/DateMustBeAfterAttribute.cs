using System.ComponentModel.DataAnnotations;

namespace Agrismart.Agronomic.UI.Pages.InputValidators
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class DateMustBeAfterAttribute : ValidationAttribute
    {
        public DateMustBeAfterAttribute(string targetDate)
            => TargetDate = targetDate;

        public string TargetDate { get; }

        public string GetErrorMessage(string propertyName) =>
            $"'Invalid Date'.";

        protected override ValidationResult? IsValid(
            object? value, ValidationContext validationContext)
        {
            if ((DateTime?)value < DateTime.Parse(TargetDate))
            {
                var propertyName = validationContext.MemberName ?? string.Empty;
                return new ValidationResult(GetErrorMessage(propertyName), new[] { propertyName });
            }

            return ValidationResult.Success;
        }
    }
}

