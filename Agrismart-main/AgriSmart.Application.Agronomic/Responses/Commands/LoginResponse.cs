using System.Text;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record LoginResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? UserName { get; set; }
        public int ProfileId { get; set; }
        public string? Token { get; set; }
        public DateTime ValidTo { get; set; }
        public bool? Active { get; set; }
    }
}
