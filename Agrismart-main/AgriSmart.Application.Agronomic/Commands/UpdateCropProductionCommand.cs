using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCropProductionCommand : IRequest<Response<UpdateCropProductionResponse>>
    {
        public int Id { get; set; }
        public int CropId { get; set; }
        public int ProductionUnitId { get; set; }
        public string? Name { get; set; }
        public int ContainerId { get; set; }
        public int GrowingMediumId { get; set; }
        public int DropperId { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public int PlantsPerContainer { get; set; }
        public int NumberOfDroppersPerContainer { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Altitude { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double DepletionPercentage { get; set; }
        public double DrainThreshold { get; set; }
        public bool Active { get; set; }
    }
}
