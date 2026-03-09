namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateContainerTypeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int FormulaType { get; set; }
        public bool? Active { get; set; }
    }
}
