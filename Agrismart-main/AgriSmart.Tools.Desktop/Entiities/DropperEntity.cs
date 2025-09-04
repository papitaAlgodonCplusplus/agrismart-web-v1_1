namespace AgriSmart.Tools.Entities
{
    public class DropperEntity : BaseEntity
    {
        public double FlowRate { get; set; } //litres/hour

        public DropperEntity(string name, double flowRate)
        {
            Name = name;
            FlowRate = flowRate;
        }

    }
}
