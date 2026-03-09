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

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int FormulaType { get; set; }

        public double Volume
        {
            get
            {
                double value = 0;

                // FormulaType: 1 = Conical, 2 = Cylinder, 3 = Cubic
                switch (FormulaType)
                {
                    case 1: // Conical Container
                        {
                            double lowerRadium = LowerDiameter / 2.0;
                            double upperRadium = UpperDiameter / 2.0;
                            double lowerArea = Math.Pow(lowerRadium, 2) * Math.PI;
                            double upperArea = Math.Pow(upperRadium, 2) * Math.PI;

                            value = 1.0 / 3.0 * (lowerArea + upperArea + Math.Sqrt(lowerArea * upperArea)) * Height / 1000.0;
                            break;
                        }
                    case 3: // Cubic Container
                        {
                            value = Height * Length * Width / 1000.0;
                            break;
                        }
                    case 2: // Cylinder Container
                        {
                            value = Math.PI * Math.Pow(UpperDiameter / 2.0, 2) * Height / 1000.0;
                            break;
                        }
                }

                return value;
            }
        }
    }
}