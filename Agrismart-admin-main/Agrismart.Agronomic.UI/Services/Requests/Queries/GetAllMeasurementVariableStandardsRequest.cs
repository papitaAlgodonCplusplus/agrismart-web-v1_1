namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllMeasurementVariableStandardsRequest
    {
        public bool IncludeInactives { get; set; }
    }
}