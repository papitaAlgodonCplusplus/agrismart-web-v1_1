using System.ComponentModel.DataAnnotations;

namespace AgriSmart.Core.Entities
{
    /// <summary>
    /// Represents crop production specifications including container spacing, area, and water availability
    /// </summary>
    public class CropProductionSpecs : BaseEntity
    {
        /// <summary>
        /// Name of the configuration
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Description of the configuration
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Distance between rows in meters
        /// </summary>
        [Required]
        [Range(0.01, 100, ErrorMessage = "BetweenRowDistance must be greater than 0")]
        public decimal BetweenRowDistance { get; set; } = 2.0m;

        /// <summary>
        /// Distance between containers in meters
        /// </summary>
        [Required]
        [Range(0.01, 100, ErrorMessage = "BetweenContainerDistance must be greater than 0")]
        public decimal BetweenContainerDistance { get; set; } = 0.5m;

        /// <summary>
        /// Distance between plants in meters
        /// </summary>
        [Required]
        [Range(0.01, 100, ErrorMessage = "BetweenPlantDistance must be greater than 0")]
        public decimal BetweenPlantDistance { get; set; } = 0.25m;

        /// <summary>
        /// Total area in square meters
        /// </summary>
        [Required]
        [Range(0.01, 1000000, ErrorMessage = "Area must be greater than 0")]
        public decimal Area { get; set; } = 1000.0m;

        /// <summary>
        /// Container volume in liters
        /// </summary>
        [Required]
        [Range(0.01, 10000, ErrorMessage = "ContainerVolume must be greater than 0")]
        public decimal ContainerVolume { get; set; } = 10.0m;

        /// <summary>
        /// Available water percentage (0-100)
        /// </summary>
        [Required]
        [Range(0, 100, ErrorMessage = "AvailableWaterPercentage must be between 0 and 100")]
        public decimal AvailableWaterPercentage { get; set; } = 50.0m;

        /// <summary>
        /// Indicates if this configuration is active
        /// </summary>
        public bool Active { get; set; } = true;
    }
}
