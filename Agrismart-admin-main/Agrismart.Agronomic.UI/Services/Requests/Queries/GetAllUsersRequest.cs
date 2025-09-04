namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllUsersRequest
    {
        public int ProfileId { get; set; }
        public int ClientId { get; set; }
        public int UserStatusId { get; set; }
    }
}