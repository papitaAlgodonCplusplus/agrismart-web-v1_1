using AgriSmart.AgronomicProcess.Logic;
using AgriSmart.AgronomicProcess.Models;



namespace AgriSmart.AgronomicProcess.Entities
{
    public enum ContainerType { conicalContainer = 1, cylinderContainer = 2, cubicContainer = 3 };

    public record ContainerEntity
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string Name { get; set; }
        public int ContainerTypeId { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double LowerDiameter { get; set; }
        public double UpperDiameter { get; set; }
        public bool Active { get; set; }
        public ContainerType ContainerType { get; set; }
        public Volume Volume { get { return getVolume(); } }

        private Volume.volumeMeasure measureType;

        public ContainerEntity(Container model)
        {
            this.CopyPropertiesFrom(model);
        }

        private Volume getVolume()
        {
            double value = 0;

            switch (ContainerType)
            {
                case ContainerType.conicalContainer:
                    {
                        double lowerRadium = LowerDiameter / 2;
                        double upperRadium = UpperDiameter / 2;
                        double lowerArea = Math.Pow(LowerDiameter, 2) * Math.PI;
                        double upperArea = Math.Pow(UpperDiameter, 2) * Math.PI;

                        value = 1 / 3 * (lowerArea + upperArea + Math.Sqrt(lowerArea * upperArea)) * Height;

                        break;
                    }
                case ContainerType.cubicContainer:
                    {
                        value = Height * Length * Width;
                        break;
                    }
                case ContainerType.cylinderContainer:
                    {
                        value = Math.PI * Math.Pow(UpperDiameter / 2, 2) * Height;
                        break;
                    }
            }

            return new Volume(value, measureType);
        }

    }
}
