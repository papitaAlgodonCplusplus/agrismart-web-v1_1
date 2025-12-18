namespace AgriSmart.Core.Entities
{
    public class Container : BaseEntity
    {
        public int CatalogId { get; set; }
        public string Name { get; set; }
        public int ContainerTypeId { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double LowerDiameter { get; set; }
        public double UpperDiameter { get; set; }
        public bool? Active { get; set; }

        public double Volume
        {
            get
            {
                double value = 0;

                // ContainerTypeId: 1 = Conical, 2 = Cylinder, 3 = Cubic
                switch (ContainerTypeId)
                {
                    case 1: // Conical Container
                        {
                            double lowerRadium = LowerDiameter / 2;
                            double upperRadium = UpperDiameter / 2;
                            double lowerArea = Math.Pow(LowerDiameter, 2) * Math.PI;
                            double upperArea = Math.Pow(UpperDiameter, 2) * Math.PI;

                            value = 1.0 / 3.0 * (lowerArea + upperArea + Math.Sqrt(lowerArea * upperArea)) * Height;
                            break;
                        }
                    case 3: // Cubic Container
                        {
                            value = Height * Length * Width;
                            break;
                        }
                    case 2: // Cylinder Container
                        {
                            value = Math.PI * Math.Pow(UpperDiameter / 2, 2) * Height;
                            break;
                        }
                }

                return value;
            }
        }
    }
}