namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllMeasurementUnitsRequest
    {
        public bool IncludeInactives { get; set; }
    }
}