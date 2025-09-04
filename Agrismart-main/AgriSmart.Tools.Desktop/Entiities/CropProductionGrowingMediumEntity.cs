using AgriSmart.Core.Entities;
using System;

namespace AgriSmart.Tools.Entities
{
    public class CropProductionGrowingMediumEntity : CropProductionEntity
    {
        public double BetweenContainerDistance { get; set; }
        public int PlantsPerContainer { get; set; }//not in DB
        public int NumberOfDroppersPerContainer { get; set; }
        public double DensityContainer { get { return getDensityContainer(); } }
        public int NumberOfContainerPerRow { get { return getNumberOfContainerPerRow(); } } 
        public double ContainerDensity { get { return getContainerDensity(); } }
        public double ContainerMediumVolumenM2 { get { return getContainerMediumVolumenM2(); } }
        public double MediumVolumenPerPlant { get { return getMediumVolumenPerPlant(); } }
        public int NumberOfContainers { get { return getNumberOfContainers(); } }
        public GrowingMediumEntity GrowingMedium { get; set; }
        public ContainerEntity Container { get; set; }
        public CropProductionGrowingMediumEntity()
        {
        }
        public CropProductionGrowingMediumEntity(int id)
        {
            this.Id = id;
        }
        public CropProductionGrowingMediumEntity(CropProduction cropProductionModel, ProductionUnitEntity productionUnit, CropEntity crop, ContainerEntity container, GrowingMediumEntity growingMedium)
        {
            Id = cropProductionModel.Id;
            Name = cropProductionModel.Name;
            ProductionUnit = productionUnit;
            Length = cropProductionModel.Length;
            Crop = crop;
            Width = cropProductionModel.Width;
            BetweenRowDistance = cropProductionModel.BetweenRowDistance;
            BetweenContainerDistance = cropProductionModel.BetweenContainerDistance;
            BetweenPlantDistance = cropProductionModel.BetweenPlantDistance;
            PlantsPerContainer = cropProductionModel.PlantsPerContainer;
            Container = container;
            GrowingMedium = growingMedium;
            StartDate = cropProductionModel.StartDate;
        }
        private double getDensityContainer()
        {
            return 1 / (BetweenRowDistance * BetweenContainerDistance);
        }
        private int getNumberOfContainerPerRow()
        {
            return Convert.ToInt32(Math.Round((Length / BetweenContainerDistance),0));
        }
        private int getNumberOfContainers()
        {
            return Convert.ToInt32(NumberOfContainerPerRow * NumberOfRows);
        }
        private double getContainerDensity()
        {
            return 1 / (BetweenContainerDistance * BetweenRowDistance);
        }
        private double getContainerMediumVolumenM2()
        {
            return Container.Volume.Value * ContainerDensity;
        }
        private double getMediumVolumenPerPlant()
        {
            return ContainerMediumVolumenM2 / DensityPlant;
        }

    }
}
