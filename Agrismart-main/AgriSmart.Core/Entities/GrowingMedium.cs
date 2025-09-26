using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    public class GrowingMedium : BaseEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }

        [NotMapped]
        public double FiveKpaHumidity { get; set; } = 10; // Not stored in database

        public bool? Active { get; set; }
    }
}