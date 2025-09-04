namespace AgriSmart.Tools.DataModels
{
    public record ClientModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}
