using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllSensorsResponse
    {
        public IReadOnlyList<Sensor>? Sensors { get; set; } = new List<Sensor>();
    }
}
